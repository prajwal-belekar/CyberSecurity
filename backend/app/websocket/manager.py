from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List, Set
import json
import asyncio
from app.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/ws", tags=["websocket"])

# Global reference to the running event loop
_running_loop = None


def set_running_loop(loop):
    global _running_loop
    _running_loop = loop


def get_running_loop():
    return _running_loop


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {
            "events": set(),
            "alerts": set(),
            "dashboard": set(),
        }

    async def connect(self, websocket: WebSocket, channel: str = "dashboard"):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = set()
        self.active_connections[channel].add(websocket)
        # Store the running loop for cross-thread notifications
        set_running_loop(asyncio.get_running_loop())

    def disconnect(self, websocket: WebSocket, channel: str = "dashboard"):
        if channel in self.active_connections:
            self.active_connections[channel].discard(websocket)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_text(json.dumps(message))

    async def broadcast(self, message: dict, channel: str = "dashboard"):
        if channel not in self.active_connections:
            return
        disconnected = set()
        for connection in self.active_connections[channel]:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                disconnected.add(connection)
        for conn in disconnected:
            self.disconnect(conn, channel)

    async def broadcast_event(self, event: dict):
        await self.broadcast({"type": "event", "data": event}, "events")
        await self.broadcast({"type": "event", "data": event}, "dashboard")

    async def broadcast_alert(self, alert: dict):
        await self.broadcast({"type": "alert", "data": alert}, "alerts")
        await self.broadcast({"type": "alert", "data": alert}, "dashboard")

    async def broadcast_metrics(self, metrics: dict):
        await self.broadcast({"type": "metrics", "data": metrics}, "dashboard")

    async def broadcast_threat(self, threat: dict):
        await self.broadcast({"type": "threat", "data": threat}, "dashboard")

    async def broadcast_incident(self, incident: dict):
        await self.broadcast({"type": "incident", "data": incident}, "dashboard")


manager = ConnectionManager()


@router.websocket("/events")
async def websocket_events(websocket: WebSocket):
    await manager.connect(websocket, "events")
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, "events")


@router.websocket("/alerts")
async def websocket_alerts(websocket: WebSocket):
    await manager.connect(websocket, "alerts")
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, "alerts")


@router.websocket("/dashboard")
async def websocket_dashboard(websocket: WebSocket):
    await manager.connect(websocket, "dashboard")
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, "dashboard")


async def notify_new_event(event: dict):
    await manager.broadcast_event(event)


def _broadcast_threadsafe(coro_func, *args):
    """Thread-safe wrapper to run async broadcast from sync context."""
    loop = get_running_loop()
    if loop and loop.is_running():
        asyncio.run_coroutine_threadsafe(coro_func(*args), loop)
    else:
        # Fallback: try to get/create event loop
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.run_coroutine_threadsafe(coro_func(*args), loop)
            else:
                loop.run_until_complete(coro_func(*args))
        except RuntimeError:
            pass  # No event loop available


def notify_new_event(event: dict):
    _broadcast_threadsafe(manager.broadcast_event, event)


def notify_new_alert(alert: dict):
    _broadcast_threadsafe(manager.broadcast_alert, alert)


def notify_metrics_update(metrics: dict):
    _broadcast_threadsafe(manager.broadcast_metrics, metrics)


def notify_threat_update(threat: dict):
    _broadcast_threadsafe(manager.broadcast_threat, threat)


def notify_incident_update(incident: dict):
    _broadcast_threadsafe(manager.broadcast_incident, incident)