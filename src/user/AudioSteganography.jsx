// AudioSteganography.jsx
import React, { useState, useRef } from 'react';
import {
  Box, TextField, Button, Typography, Paper, Alert, LinearProgress,
  IconButton, InputAdornment, Divider, Chip, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip,
  CircularProgress, Fade, AppBar, Toolbar, Container, alpha, useTheme,
} from '@mui/material';
import {
  Upload as UploadIcon, Lock as LockIcon, LockOpen as LockOpenIcon,
  TextFields as TextIcon, Audiotrack as AudioIcon, Save as SaveIcon,
  Edit as EditIcon, Security as SecurityIcon,
  CheckCircle as CheckIcon, Error as ErrorIcon,
  Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon,
  PlayArrow as PlayIcon, Stop as StopIcon,
  ArrowBack as ArrowBackIcon, Home as HomeIcon, GitHub as GitHubIcon,
  Delete as DeleteIcon, CloudUpload as CloudUploadIcon,
  Warning as WarningIcon, Info as InfoIcon,
} from '@mui/icons-material';
import CryptoJS from 'crypto-js';
import { useThemeContext } from '../contexts/ThemeContext';

// ─────────────────────────────────────────────────────────────────────────────
// Supported formats
// ─────────────────────────────────────────────────────────────────────────────
const SUPPORTED_FORMATS = [
  '.mp3', '.wav', '.m4a', '.ogg', '.aac', '.flac', '.webm',
  '.mpeg', '.mpga', '.mp2', '.mp2a', '.mp4a',
  '.opus', '.3gp', '.3g2', '.amr',
];

const AUDIO_MIME_PREFIXES = ['audio/', 'video/ogg', 'video/webm'];

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: Consistent float ↔ int16 helpers used by BOTH hide AND bufferToWav
// Rule: float32 → int16 via Math.round (not floor), symmetric around 0
// ─────────────────────────────────────────────────────────────────────────────
const F32_TO_I16 = (f) => {
  const clamped = Math.max(-1, Math.min(1, f));
  return Math.round(clamped * 32767);   // consistent rounding, no asymmetry
};
const I16_TO_F32 = (i) => i / 32767;

// ─────────────────────────────────────────────────────────────────────────────
// Core steganography — all LSB operations use F32_TO_I16 / I16_TO_F32
// ─────────────────────────────────────────────────────────────────────────────
class AudioSteg {

  /* text → 16-bit Unicode binary string */
  static textToBinary(text) {
    return Array.from(text)
      .map(c => c.charCodeAt(0).toString(2).padStart(16, '0'))
      .join('');
  }

  /* binary string → text */
  static binaryToText(binary) {
    let out = '';
    for (let i = 0; i + 16 <= binary.length; i += 16) {
      out += String.fromCharCode(parseInt(binary.substr(i, 16), 2));
    }
    return out;
  }

  static encrypt(text, pw) {
    return CryptoJS.AES.encrypt(text, pw).toString();
  }

  static decrypt(enc, pw) {
    // returns null on wrong password instead of throwing opaque error
    try {
      const bytes = CryptoJS.AES.decrypt(enc, pw);
      const plain = bytes.toString(CryptoJS.enc.Utf8);
      return plain || null;
    } catch {
      return null;
    }
  }

  /* ── Hide text ── */
  static async hideText(audioBuffer, secretText, password, onProgress) {
    return new Promise((resolve, reject) => {
      try {
        const encrypted = this.encrypt(secretText, password);
        // Delimiter: 16 ones followed by a zero (can never appear in normal text)
        const DELIM = '1111111111111110';
        const bits  = this.textToBinary(encrypted) + DELIM;

        const audioData = audioBuffer.getChannelData(0);

        if (bits.length > audioData.length) {
          const max = Math.floor(audioData.length / 16);
          reject(new Error(`Text too long. Max ~${max.toLocaleString()} characters for this audio.`));
          return;
        }

        // Work on a copy
        const newData = new Float32Array(audioData);

        for (let i = 0; i < bits.length; i++) {
          const bit     = parseInt(bits[i], 10);          // 0 or 1
          const i16     = F32_TO_I16(newData[i]);         // float → int16
          const patched = (i16 & ~1) | bit;               // set LSB
          newData[i]    = I16_TO_F32(patched);            // back to float

          if (onProgress && i % 2000 === 0) {
            onProgress(Math.round((i / bits.length) * 100));
          }
        }
        onProgress(100);

        // Build output buffer
        const outCtx = new (window.AudioContext || window.webkitAudioContext)();
        const outBuf = outCtx.createBuffer(
          audioBuffer.numberOfChannels,
          audioBuffer.length,
          audioBuffer.sampleRate,
        );

        for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
          const src = audioBuffer.getChannelData(ch);
          const dst = outBuf.getChannelData(ch);
          if (ch === 0) {
            dst.set(newData);
          } else {
            dst.set(src);
          }
        }

        resolve(outBuf);
      } catch (e) {
        reject(e);
      }
    });
  }

  /* ── Extract text ── */
  static async extractText(audioBuffer, password, onProgress) {
    return new Promise((resolve, reject) => {
      try {
        const audioData = audioBuffer.getChannelData(0);
        const DELIM     = '1111111111111110';
        let   bits      = '';
        let   found     = false;

        for (let i = 0; i < audioData.length; i++) {
          // FIX: use the same F32_TO_I16 as hideText for consistent LSB
          const i16 = F32_TO_I16(audioData[i]);
          bits += (i16 & 1).toString();

          if (bits.length >= DELIM.length) {
            if (bits.slice(-DELIM.length) === DELIM) {
              bits  = bits.slice(0, -DELIM.length);
              found = true;
              break;
            }
          }

          if (onProgress && i % 10000 === 0) {
            onProgress(Math.round((i / audioData.length) * 100));
          }
        }

        if (!found) {
          reject(new Error('No hidden message found in this audio file. Make sure you are using the correct stego WAV file.'));
          return;
        }

        onProgress(100);

        const encryptedText = this.binaryToText(bits);
        const decrypted     = this.decrypt(encryptedText, password);

        if (decrypted === null) {
          reject(new Error('Wrong password — decryption failed. Please check and try again.'));
          return;
        }

        resolve(decrypted);
      } catch (e) {
        reject(new Error(e.message || 'Extraction failed'));
      }
    });
  }

  /* ── AudioBuffer → WAV Blob ──
   * Uses F32_TO_I16 — must match hideText exactly so LSBs survive the round-trip
   */
  static bufferToWav(audioBuffer) {
    const numCh   = audioBuffer.numberOfChannels;
    const sr      = audioBuffer.sampleRate;
    const samples = audioBuffer.length;
    const dataLen = samples * numCh * 2;          // 2 bytes per int16 sample

    const buf  = new ArrayBuffer(44 + dataLen);
    const view = new DataView(buf);

    const ws = (off, str) => {
      for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i));
    };

    ws(0,  'RIFF');
    view.setUint32( 4, 36 + dataLen, true);
    ws(8,  'WAVE');
    ws(12, 'fmt ');
    view.setUint32(16, 16, true);           // PCM chunk size
    view.setUint16(20,  1, true);           // PCM format
    view.setUint16(22, numCh, true);
    view.setUint32(24, sr, true);
    view.setUint32(28, sr * numCh * 2, true);
    view.setUint16(32, numCh * 2, true);
    view.setUint16(34, 16, true);           // bit depth
    ws(36, 'data');
    view.setUint32(40, dataLen, true);

    // Interleaved channel data — using F32_TO_I16 (same as hideText)
    const chData = Array.from({ length: numCh }, (_, c) => audioBuffer.getChannelData(c));
    let off = 44;
    for (let i = 0; i < samples; i++) {
      for (let ch = 0; ch < numCh; ch++) {
        view.setInt16(off, F32_TO_I16(chData[ch][i]), true);
        off += 2;
      }
    }

    return new Blob([buf], { type: 'audio/wav' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FIXED decodeAnyAudio — two strategies, ScriptProcessor bug fixed
// ─────────────────────────────────────────────────────────────────────────────
async function decodeAnyAudio(file) {

  // ── Strategy 1: Web Audio decodeAudioData (WAV, MP3, FLAC, OGG, M4A, …)
  try {
    const ab  = await file.arrayBuffer();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = await ctx.decodeAudioData(ab);
    await ctx.close();
    return buf;
  } catch (e) {
    console.warn('Strategy 1 failed:', e.message, '— trying MediaElement fallback');
  }

  // ── Strategy 2: MediaElement playback capture (MPEG, OPUS, AMR, 3GP, …)
  // FIX: we now wait for silence *after* ended AND flush remaining chunks
  // before resolving, so no samples are lost.
  return new Promise((resolve, reject) => {
    const url   = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = 'auto';

    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(
        `Cannot decode "${file.name}". ` +
        'Try opening it in Chrome/Edge, or convert to MP3/WAV first.'
      ));
    };

    audio.addEventListener('canplaythrough', async () => {
      const duration = audio.duration;
      if (!isFinite(duration) || duration <= 0) {
        URL.revokeObjectURL(url);
        reject(new Error('Cannot determine audio duration.'));
        return;
      }

      try {
        const TARGET_SR = 44100;
        const CHANNELS  = 2;
        const CHUNK     = 4096;

        const liveCtx  = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: TARGET_SR });
        const srcNode  = liveCtx.createMediaElementSource(audio);
        const captured = Array.from({ length: CHANNELS }, () => []);

        // ScriptProcessorNode — deprecated but universally supported
        const processor = liveCtx.createScriptProcessor(CHUNK, CHANNELS, CHANNELS);

        processor.onaudioprocess = (e) => {
          for (let ch = 0; ch < CHANNELS; ch++) {
            // Clone the buffer — it gets reused by the browser otherwise
            captured[ch].push(new Float32Array(e.inputBuffer.getChannelData(ch)));
          }
        };

        srcNode.connect(processor);
        processor.connect(liveCtx.destination); // must be connected to fire

        audio.currentTime = 0;
        await audio.play();

        // Wait for playback to finish
        await new Promise(res => audio.addEventListener('ended', res, { once: true }));

        // FIX: wait exactly one ScriptProcessor cycle after 'ended' so the
        // last partial buffer is still processed, then a second tick for safety
        await new Promise(res => setTimeout(res, Math.ceil(CHUNK / TARGET_SR * 1000) + 100));

        processor.disconnect();
        srcNode.disconnect();
        await liveCtx.close();

        const totalSamples = captured[0].reduce((s, c) => s + c.length, 0);
        if (totalSamples === 0) throw new Error('No audio samples captured.');

        // Assemble into a single AudioBuffer
        const assemblyCtx = new (window.AudioContext || window.webkitAudioContext)();
        const finalBuf    = assemblyCtx.createBuffer(CHANNELS, totalSamples, TARGET_SR);

        for (let ch = 0; ch < CHANNELS; ch++) {
          const dst = finalBuf.getChannelData(ch);
          let   off = 0;
          for (const chunk of captured[ch]) {
            dst.set(chunk, off);
            off += chunk.length;
          }
        }
        await assemblyCtx.close();

        URL.revokeObjectURL(url);
        resolve(finalBuf);
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    }, { once: true });

    audio.src = url;
    audio.load();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function looksLikeAudio(file) {
  if (AUDIO_MIME_PREFIXES.some(p => file.type.startsWith(p))) return true;
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  return SUPPORTED_FORMATS.includes(ext);
}

function fmtSize(bytes) {
  if (!bytes) return '0 B';
  const u = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${u[i]}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function AudioSteganography() {
  const theme  = useTheme();
  const { mode, toggleTheme } = useThemeContext();
  const isDark = mode === 'dark';

  // ── state ──
  const [activeTab,        setActiveTab]        = useState('hide');
  const [audioBuffer,      setAudioBuffer]      = useState(null);
  const [secretText,       setSecretText]       = useState('');  // renamed from 'text' to avoid conflict
  const [password,         setPassword]         = useState('');
  const [showPassword,     setShowPassword]     = useState(false);
  const [extractedText,    setExtractedText]    = useState('');
  const [fileName,         setFileName]         = useState('');
  const [fileSize,         setFileSize]         = useState('');
  const [outputFileName,   setOutputFileName]   = useState('');
  const [loading,          setLoading]          = useState(false);
  const [decoding,         setDecoding]         = useState(false);
  const [progress,         setProgress]         = useState(0);
  // FIX: renamed state key to 'msg' and 'severity' to avoid shadowing 'text' input state
  const [alertMsg,         setAlertMsg]         = useState('');
  const [alertSev,         setAlertSev]         = useState('info');
  const [audioPreview,     setAudioPreview]     = useState(null);
  const [isPlaying,        setIsPlaying]        = useState(false);
  const [renameOpen,       setRenameOpen]       = useState(false);
  const [dragActive,       setDragActive]       = useState(false);
  const [fallbackWarning,  setFallbackWarning]  = useState('');

  const audioRef    = useRef(null);
  const fileInputRef= useRef(null);

  // ── show alert helper ──
  const showAlert = (msg, sev = 'info') => {
    setAlertMsg(msg);
    setAlertSev(sev);
  };
  const clearAlert = () => setAlertMsg('');

  // ── load file ──
  const loadAudioFile = async (file) => {
    if (!file) return;
    if (!looksLikeAudio(file)) {
      showAlert(`Unsupported format. Accepted: ${SUPPORTED_FORMATS.join(', ')}`, 'error');
      return;
    }

    setFallbackWarning('');
    setDecoding(true);
    clearAlert();

    if (audioPreview) URL.revokeObjectURL(audioPreview);
    setAudioPreview(URL.createObjectURL(file));
    setFileName(file.name);
    setFileSize(fmtSize(file.size));
    setOutputFileName('stego_' + file.name.replace(/\.[^/.]+$/, '') + '.wav');

    try {
      const buffer = await decodeAnyAudio(file);
      setAudioBuffer(buffer);

      const ext = '.' + file.name.split('.').pop().toLowerCase();
      const isFallback = ['.mpeg','.mpga','.opus','.amr','.3gp','.3g2','.mp4a'].includes(ext);
      if (isFallback) {
        setFallbackWarning(
          `${ext.toUpperCase()} decoded via real-time audio capture. ` +
          `Use the downloaded WAV file for extraction — do not use the original ${ext.toUpperCase()}.`
        );
      }

      showAlert(
        `Loaded "${file.name}" — capacity ~${Math.floor(buffer.length / 16).toLocaleString()} characters.`,
        'success',
      );
    } catch (err) {
      console.error('Audio load error:', err);
      showAlert(err.message, 'error');
      setAudioBuffer(null);
    } finally {
      setDecoding(false);
    }
  };

  const handleFileUpload = (e) => loadAudioFile(e.target.files?.[0]);
  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    loadAudioFile(e.dataTransfer.files?.[0]);
  };

  // ── hide text ──
  const handleHideText = async () => {
    if (!audioBuffer)        { showAlert('Upload an audio file first.',  'warning'); return; }
    if (!secretText.trim())  { showAlert('Enter a secret message.',      'warning'); return; }
    if (!password)           { showAlert('Enter a password.',            'warning'); return; }

    setLoading(true); setProgress(0); clearAlert();

    try {
      const stegoBuffer = await AudioSteg.hideText(audioBuffer, secretText, password, setProgress);
      const wavBlob     = AudioSteg.bufferToWav(stegoBuffer);
      const url         = URL.createObjectURL(wavBlob);
      const a           = document.createElement('a');
      a.href = url;
      a.download = outputFileName || 'stego_audio.wav';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showAlert('Message hidden successfully! WAV file has been downloaded.', 'success');
      setSecretText('');
      setPassword('');
    } catch (err) {
      console.error('Hide error:', err);
      showAlert(err.message || 'Failed to hide text.', 'error');
    } finally {
      setLoading(false); setProgress(0);
    }
  };

  // ── extract text ──
  const handleExtractText = async () => {
    if (!audioBuffer) { showAlert('Upload the stego WAV file first.', 'warning'); return; }
    if (!password)    { showAlert('Enter the password.',              'warning'); return; }

    setLoading(true); setProgress(0); clearAlert();

    try {
      const result = await AudioSteg.extractText(audioBuffer, password, setProgress);
      setExtractedText(result);
      showAlert('Message extracted successfully!', 'success');
    } catch (err) {
      console.error('Extract error:', err);
      // Always show the specific error message — no more silent swallowing
      showAlert(err.message || 'Extraction failed.', 'error');
    } finally {
      setLoading(false); setProgress(0);
    }
  };

  const handleRenameConfirm = () => {
    let n = outputFileName.trim();
    if (n && !n.toLowerCase().endsWith('.wav')) n += '.wav';
    setOutputFileName(n);
    setRenameOpen(false);
  };

  const handleClear = () => {
    setAudioBuffer(null); setSecretText(''); setPassword(''); setExtractedText('');
    setFileName(''); setFileSize(''); setOutputFileName(''); clearAlert(); setFallbackWarning('');
    if (audioPreview) { URL.revokeObjectURL(audioPreview); setAudioPreview(null); }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else           { audioRef.current.play();  setIsPlaying(true);  }
  };

  const maxChars = audioBuffer ? Math.floor(audioBuffer.length / 16) : 0;

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default }}>

      {/* AppBar */}
      <AppBar position="fixed" elevation={0} sx={{
        bgcolor: alpha(theme.palette.background.paper, 0.85),
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}>
        <Toolbar>
          <IconButton onClick={() => window.history.back()}
            sx={{ mr:1, color: theme.palette.primary.main, transition:'transform 0.2s', '&:hover':{ transform:'scale(1.1)' } }}>
            <ArrowBackIcon/>
          </IconButton>
          <IconButton onClick={() => { window.location.href = '/'; }}
            sx={{ mr:2, color: theme.palette.primary.main }}>
            <HomeIcon/>
          </IconButton>
          <SecurityIcon sx={{ mr:1.5, color: theme.palette.primary.main }}/>
          <Typography variant="h6" sx={{ flexGrow:1, fontWeight:700 }}>
            Audio Steganography Tool
          </Typography>
          <Tooltip title="Toggle Theme">
            <IconButton onClick={toggleTheme} sx={{ color: theme.palette.primary.main }}>
              {isDark ? '☀️' : '🌙'}
            </IconButton>
          </Tooltip>
          <Tooltip title="View on GitHub">
            <IconButton onClick={() => window.open('https://github.com', '_blank')}
              sx={{ color: theme.palette.primary.main }}>
              <GitHubIcon/>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ pt:12, pb:4 }}>
        <Paper elevation={3} sx={{ p:{ xs:2, sm:4 }, borderRadius:4 }}>

          {/* Mode tabs */}
          <Box sx={{ borderBottom:1, borderColor:'divider', mb:4 }}>
            <Box sx={{ display:'flex', gap:2, justifyContent:'center' }}>
              {[
                { id:'hide',    label:'Hide Text',    Icon: LockIcon },
                { id:'extract', label:'Extract Text', Icon: LockOpenIcon },
              ].map(({ id, label, Icon }) => (
                <Button key={id}
                  variant={activeTab === id ? 'contained' : 'outlined'}
                  onClick={() => setActiveTab(id)}
                  startIcon={<Icon/>}
                  sx={{ px:4 }}>
                  {label}
                </Button>
              ))}
            </Box>
          </Box>

          <Box sx={{ display:'flex', flexDirection:{ xs:'column', md:'row' }, gap:4 }}>

            {/* ── Left column ── */}
            <Box sx={{ flex:1 }}>

              {/* Upload card */}
              <Card variant="outlined" sx={{ mb:3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <AudioIcon sx={{ mr:1, verticalAlign:'middle' }}/>
                    Audio File
                  </Typography>

                  <Box onDragEnter={handleDrag} onDragLeave={handleDrag}
                    onDragOver={handleDrag} onDrop={handleDrop} sx={{ mt:2 }}>

                    <input
                      accept={[
                        'audio/*',
                        '.mpeg','.mpga','.opus','.amr','.3gp','.3g2',
                      ].join(',')}
                      style={{ display:'none' }}
                      id="audio-upload"
                      type="file"
                      onChange={handleFileUpload}
                      ref={fileInputRef}
                    />
                    <label htmlFor="audio-upload">
                      <Button variant="outlined" component="span" fullWidth
                        startIcon={<UploadIcon/>} sx={{ py:1.5 }}>
                        Choose Audio File
                      </Button>
                    </label>

                    {/* Drop zone */}
                    <Box onClick={() => fileInputRef.current?.click()} sx={{
                      mt:2, border:`2px dashed ${dragActive ? theme.palette.primary.main : theme.palette.divider}`,
                      borderRadius:2, p:3, textAlign:'center', cursor:'pointer',
                      bgcolor: dragActive ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                      transition:'all 0.25s',
                      '&:hover':{ borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.05) },
                    }}>
                      {decoding ? (
                        <>
                          <CircularProgress size={36} sx={{ mb:1 }}/>
                          <Typography variant="body2">Decoding audio…</Typography>
                          <Typography variant="caption" color="text.secondary">
                            MPEG / OPUS files are captured in real-time — this may take a moment
                          </Typography>
                        </>
                      ) : (
                        <>
                          <CloudUploadIcon sx={{ fontSize:44, color: theme.palette.primary.main, mb:1 }}/>
                          <Typography variant="body1" gutterBottom>Drag & drop audio here</Typography>
                          <Typography variant="caption" color="text.secondary">
                            MP3, WAV, OGG, FLAC, M4A, AAC, WEBM,{' '}
                            <strong>MPEG, OPUS, AMR, 3GP</strong> (WhatsApp voice notes)
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>

                  {/* File info */}
                  {fileName && !decoding && (
                    <Box sx={{ mt:2 }}>
                      <Box sx={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:1, mb:1 }}>
                        <Chip
                          label={fileName}
                          color="primary"
                          size="small"
                          sx={{ maxWidth:200, '& .MuiChip-label':{ overflow:'hidden', textOverflow:'ellipsis' } }}
                        />
                        <Typography variant="caption" color="text.secondary">{fileSize}</Typography>
                        <IconButton size="small" color="error" onClick={handleClear}>
                          <DeleteIcon fontSize="small"/>
                        </IconButton>
                      </Box>

                      {fallbackWarning && (
                        <Alert severity="warning" icon={<WarningIcon fontSize="small"/>}
                          sx={{ mb:1, py:0.5, '& .MuiAlert-message':{ fontSize:12 } }}>
                          {fallbackWarning}
                        </Alert>
                      )}

                      <Box sx={{ display:'flex', alignItems:'center', gap:1, mt:1 }}>
                        <IconButton size="small" onClick={togglePlay} disabled={!audioPreview}
                          sx={{ color: theme.palette.primary.main }}>
                          {isPlaying ? <StopIcon/> : <PlayIcon/>}
                        </IconButton>
                        <audio ref={audioRef} src={audioPreview}
                          onEnded={() => setIsPlaying(false)}
                          style={{ flex:1, height:36 }} controls/>
                      </Box>

                      <Typography variant="caption" color="text.secondary" sx={{ mt:0.5, display:'block' }}>
                        Capacity: ~{maxChars.toLocaleString()} characters
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Output settings */}
              {activeTab === 'hide' && (
                <Card variant="outlined" sx={{ mb:3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <SaveIcon sx={{ mr:1, verticalAlign:'middle' }}/>
                      Output Settings
                    </Typography>
                    <TextField fullWidth label="Output File Name"
                      value={outputFileName}
                      onChange={e => setOutputFileName(e.target.value)}
                      placeholder="stego_audio.wav"
                      helperText="Always saved as WAV to preserve the hidden data"
                      InputProps={{
                        endAdornment:(
                          <InputAdornment position="end">
                            <IconButton onClick={() => setRenameOpen(true)} edge="end">
                              <EditIcon/>
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mt:2 }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Password */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <SecurityIcon sx={{ mr:1, verticalAlign:'middle' }}/>
                    Password
                  </Typography>
                  <TextField fullWidth label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        activeTab === 'hide' ? handleHideText() : handleExtractText();
                      }
                    }}
                    InputProps={{
                      endAdornment:(
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(v => !v)} edge="end">
                            {showPassword ? <VisibilityOffIcon/> : <VisibilityIcon/>}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mt:2 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt:0.5, display:'block' }}>
                    Use the exact same password to extract the message later
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* ── Right column ── */}
            <Box sx={{ flex:1 }}>
              {activeTab === 'hide' ? (
                <Card variant="outlined" sx={{ height:'100%' }}>
                  <CardContent sx={{ display:'flex', flexDirection:'column', height:'100%' }}>
                    <Typography variant="h6" gutterBottom>
                      <TextIcon sx={{ mr:1, verticalAlign:'middle' }}/>
                      Secret Message
                    </Typography>

                    <TextField fullWidth multiline rows={12}
                      placeholder="Enter the secret message to embed in the audio…"
                      value={secretText}
                      onChange={e => setSecretText(e.target.value)}
                      sx={{ mt:2 }}
                    />

                    <Box sx={{ mt:1, display:'flex', justifyContent:'space-between' }}>
                      <Typography variant="caption" color="text.secondary">
                        {secretText.length} characters
                      </Typography>
                      {audioBuffer && (
                        <Typography variant="caption"
                          color={secretText.length > maxChars ? 'error.main' : 'text.secondary'}>
                          Max: {maxChars.toLocaleString()}
                        </Typography>
                      )}
                    </Box>

                    <Button fullWidth variant="contained"
                      onClick={handleHideText}
                      disabled={loading || decoding || !audioBuffer || !secretText.trim() || !password}
                      startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <LockIcon/>}
                      sx={{ mt:3, py:1.5 }}>
                      {loading ? 'Hiding message…' : 'Hide & Download Audio'}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card variant="outlined" sx={{ height:'100%' }}>
                  <CardContent sx={{ display:'flex', flexDirection:'column', height:'100%' }}>
                    <Typography variant="h6" gutterBottom>
                      <TextIcon sx={{ mr:1, verticalAlign:'middle' }}/>
                      Extracted Message
                    </Typography>

                    <Alert severity="info" icon={<InfoIcon fontSize="small"/>}
                      sx={{ mt:1, mb:1, '& .MuiAlert-message':{ fontSize:12 } }}>
                      Upload the stego <strong>WAV</strong> file (not the original audio) and enter the password.
                    </Alert>

                    <TextField fullWidth multiline rows={10}
                      placeholder="Extracted message will appear here…"
                      value={extractedText}
                      InputProps={{ readOnly:true }}
                      sx={{ mt:1 }}
                    />

                    <Button fullWidth variant="contained"
                      onClick={handleExtractText}
                      disabled={loading || decoding || !audioBuffer || !password}
                      startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <LockOpenIcon/>}
                      sx={{ mt:3, py:1.5 }}>
                      {loading ? 'Extracting…' : 'Extract Message'}
                    </Button>

                    {extractedText && (
                      <Button fullWidth variant="outlined"
                        onClick={() => {
                          navigator.clipboard.writeText(extractedText)
                            .then(() => showAlert('Copied to clipboard!', 'success'))
                            .catch(() => showAlert('Copy failed — check browser permissions.', 'error'));
                        }}
                        sx={{ mt:2 }}>
                        Copy to Clipboard
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </Box>
          </Box>

          {/* Progress bar */}
          {loading && (
            <Box sx={{ mt:3 }}>
              <LinearProgress variant="determinate" value={progress}/>
              <Typography variant="caption" color="text.secondary"
                sx={{ mt:0.5, display:'block', textAlign:'center' }}>
                {Math.round(progress)}%
              </Typography>
            </Box>
          )}

          {/* ── Alert message — FIX: uses alertMsg/alertSev, no name collision ── */}
          {alertMsg && (
            <Fade in={!!alertMsg}>
              <Alert
                severity={alertSev}
                onClose={clearAlert}
                icon={
                  alertSev === 'success' ? <CheckIcon/> :
                  alertSev === 'error'   ? <ErrorIcon/> :
                  alertSev === 'warning' ? <WarningIcon/> :
                  <InfoIcon/>
                }
                sx={{ mt:3 }}
              >
                {alertMsg}
              </Alert>
            </Fade>
          )}

          {/* Info section */}
          <Divider sx={{ my:4 }}/>
          <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), p:3, borderRadius:2 }}>
            <Typography variant="h6" gutterBottom>How It Works</Typography>
            <Box sx={{ display:'flex', flexDirection:{ xs:'column', md:'row' }, gap:3 }}>
              {[
                {
                  title: '1. Upload Audio',
                  body: 'Any audio file — including WhatsApp voice notes (.mpeg, .opus, .amr, .3gp)',
                },
                {
                  title: '2. Add Message & Password',
                  body: 'Enter your secret message and choose a strong password for AES-256 encryption',
                },
                {
                  title: '3. Download & Extract',
                  body: 'Download the stego WAV. Upload it again and enter the same password to extract',
                },
              ].map(({ title, body }) => (
                <Box key={title} sx={{ flex:1 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>{title}</Typography>
                  <Typography variant="body2" color="text.secondary">{body}</Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ mt:3, p:2, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius:1 }}>
              <Typography variant="subtitle2" color="info.main" gutterBottom>
                WhatsApp / MPEG Notes
              </Typography>
              <Typography variant="body2" color="text.secondary" component="div">
                <ul style={{ margin:'4px 0', paddingLeft:18 }}>
                  <li>WhatsApp voice notes are typically <strong>.opus</strong> or <strong>.mpeg</strong> — both supported.</li>
                  <li>These formats use real-time capture. The browser plays them while PCM samples are recorded.</li>
                  <li><strong>Always use the downloaded WAV for extraction</strong> — not the original .mpeg/.opus file.</li>
                  <li>Capacity ≈ 2 750 characters per second of audio at 44 100 Hz.</li>
                </ul>
              </Typography>
            </Box>
          </Box>

        </Paper>
      </Container>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)}>
        <DialogTitle>Rename Output File</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="File Name"
            value={outputFileName}
            onChange={e => setOutputFileName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRenameConfirm()}
            helperText="Will be saved as WAV"
            sx={{ mt:2 }}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameOpen(false)}>Cancel</Button>
          <Button onClick={handleRenameConfirm} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}