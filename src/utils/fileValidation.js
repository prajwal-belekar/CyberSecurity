/**
 * Client-side submission gating for the malware analyzer.
 *
 * IMPORTANT: this is a UX guard only. It decides whether an artifact is worth
 * sending to the backend sandbox — it never inspects, parses, decodes or
 * executes file contents, and it is not a security control. The authoritative
 * checks happen server-side.
 */
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
/** Extensions the isolated sandbox accepts for analysis. */
export const ALLOWED_EXTENSIONS = [
    // executables and libraries
    'exe', 'dll', 'sys', 'scr', 'cpl', 'msi', 'apk', 'jar', 'elf', 'so', 'dylib', 'bin',
    // scripts
    'ps1', 'psm1', 'bat', 'cmd', 'vbs', 'vbe', 'js', 'jse', 'wsf', 'wsh', 'py', 'sh', 'hta',
    // documents (common macro/phishing carriers)
    'doc', 'docx', 'docm', 'xls', 'xlsx', 'xlsm', 'ppt', 'pptx', 'pptm', 'pdf', 'rtf', 'odt', 'ods', 'one',
    // archives
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'iso', 'img', 'cab',
];
/** MIME families accepted when an extension cannot be determined. */
const ALLOWED_MIME_PREFIXES = ['application/', 'text/', 'multipart/'];
function extensionOf(value) {
    const clean = value.trim().toLowerCase().replace(/[^\w.\-]/g, '');
    const index = clean.lastIndexOf('.');
    return index >= 0 ? clean.slice(index + 1) : '';
}
/**
 * @param mimeOrName the file's MIME type, or its name when no type is known.
 */
export function isAllowedFileType(mimeOrName) {
    const value = (mimeOrName ?? '').trim().toLowerCase();
    if (!value)
        return false;
    const extension = extensionOf(value);
    if (extension && ALLOWED_EXTENSIONS.includes(extension))
        return true;
    if (value.includes('/'))
        return ALLOWED_MIME_PREFIXES.some((prefix) => value.startsWith(prefix));
    return false;
}
/** Size + type gate used by the uploader before a submission is accepted. */
export function validateSubmission(fileName, sizeBytes, mime = '') {
    if (!fileName.trim())
        return { ok: false, reason: 'No file selected.' };
    if (sizeBytes <= 0)
        return { ok: false, reason: 'The selected file is empty.' };
    if (sizeBytes > MAX_UPLOAD_BYTES) {
        return { ok: false, reason: `Rejected: file exceeds the ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB submission limit.` };
    }
    if (!isAllowedFileType(mime || fileName)) {
        return { ok: false, reason: `Rejected: "${fileName}" is not a supported artifact type. Supported: executables, scripts, documents and archives.` };
    }
    return { ok: true };
}
