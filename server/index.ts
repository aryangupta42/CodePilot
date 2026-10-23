import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (_req: Request, res: Response) => {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    configuredProvider: hasGemini ? 'gemini' : (hasOpenAI ? 'openai' : 'none'),
    message: hasGemini || hasOpenAI 
      ? 'Live AI Provider active on server' 
      : 'No external API keys in server environment. Client built-in diagnostic engine will be utilized.'
  });
});

app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { mode, prompt, projectName, projectType, runtimeError, files } = req.body;

  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    // Graceful response directing client to local engine
    return res.status(200).json({
      content: `[Server Mode: Offline/Demo] No external API key found on server. Using CodePilot Built-in Diagnostic Engine.`,
      fallbackToClient: true
    });
  }

  try {
    if (geminiKey) {
      // Call Google Gemini API
      const systemInstruction = `You are CodePilot AI, a context-aware developer tool and pair programmer.
Analyze code accurately, diagnose root causes, and propose targeted patches.
Project: ${projectName} (${projectType}).
User Mode: ${mode}.`;

      const promptPayload = `Mode: ${mode}
Prompt: ${prompt}
Runtime Error (if any): ${JSON.stringify(runtimeError || null)}
Files Context:
${(files || []).map((f: any) => `--- File: ${f.name} ---\n${f.content}\n`).join('\n')}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemInstruction}\n\n${promptPayload}` }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1500
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

      return res.json({
        content: text,
        source: 'live-api'
      });
    }

    if (openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: `You are CodePilot AI. Mode: ${mode}. Project: ${projectName} (${projectType}).` },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2
        })
      });

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || 'No response generated.';

      return res.json({
        content: text,
        source: 'live-api'
      });
    }
  } catch (error: any) {
    console.error('Server AI request failed:', error);
    return res.status(500).json({
      error: error.message || 'AI processing failure',
      fallbackToClient: true
    });
  }
});

app.post('/api/run/native', (req: Request, res: Response) => {
  const { language, code } = req.body;
  const startTime = Date.now();
  const tmpDir = os.tmpdir();
  const runId = `codepilot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const workDir = path.join(tmpDir, runId);

  const cleanUp = () => {
    try {
      if (fs.existsSync(workDir)) {
        fs.rmSync(workDir, { recursive: true, force: true });
      }
    } catch {}
  };

  try {
    fs.mkdirSync(workDir, { recursive: true });

    if (language === 'c') {
      const srcFile = path.join(workDir, 'main.c');
      const exeFile = path.join(workDir, 'main.exe');
      fs.writeFileSync(srcFile, code || '', 'utf-8');

      const gccCmd = fs.existsSync('C:\\MinGW\\bin\\gcc.exe') ? 'C:\\MinGW\\bin\\gcc.exe' : 'gcc';
      exec(`"${gccCmd}" "${srcFile}" -o "${exeFile}"`, { timeout: 10000 }, (compileErr, _stdout, compileStderr) => {
        if (compileErr) {
          const duration = Date.now() - startTime;
          cleanUp();
          const errText = compileStderr || compileErr.message;
          return res.json({
            success: false,
            exitCode: 1,
            stdout: [],
            stderr: [errText],
            durationMs: duration,
            error: { message: errText }
          });
        }

        exec(`"${exeFile}"`, { timeout: 10000, maxBuffer: 1024 * 1024 }, (runErr, runStdout, runStderr) => {
          const duration = Date.now() - startTime;
          cleanUp();
          res.json({
            success: !runErr,
            exitCode: runErr ? (runErr.code ?? 1) : 0,
            stdout: runStdout ? runStdout.split(/\r?\n/) : [],
            stderr: runStderr ? runStderr.split(/\r?\n/) : [],
            durationMs: duration,
            error: runErr ? { message: runStderr || runErr.message } : undefined
          });
        });
      });
      return;
    }

    if (language === 'cpp') {
      const srcFile = path.join(workDir, 'main.cpp');
      const exeFile = path.join(workDir, 'main.exe');
      fs.writeFileSync(srcFile, code || '', 'utf-8');

      const gppCmd = fs.existsSync('C:\\MinGW\\bin\\g++.exe') ? 'C:\\MinGW\\bin\\g++.exe' : 'g++';
      exec(`"${gppCmd}" "${srcFile}" -o "${exeFile}"`, { timeout: 10000 }, (compileErr, _stdout, compileStderr) => {
        if (compileErr) {
          const duration = Date.now() - startTime;
          cleanUp();
          const errText = compileStderr || compileErr.message;
          return res.json({
            success: false,
            exitCode: 1,
            stdout: [],
            stderr: [errText],
            durationMs: duration,
            error: { message: errText }
          });
        }

        exec(`"${exeFile}"`, { timeout: 10000, maxBuffer: 1024 * 1024 }, (runErr, runStdout, runStderr) => {
          const duration = Date.now() - startTime;
          cleanUp();
          res.json({
            success: !runErr,
            exitCode: runErr ? (runErr.code ?? 1) : 0,
            stdout: runStdout ? runStdout.split(/\r?\n/) : [],
            stderr: runStderr ? runStderr.split(/\r?\n/) : [],
            durationMs: duration,
            error: runErr ? { message: runStderr || runErr.message } : undefined
          });
        });
      });
      return;
    }

    if (language === 'java') {
      const classMatch = (code || '').match(/public\s+class\s+([A-Za-z0-9_]+)/);
      const className = classMatch ? classMatch[1] : 'Main';
      const srcFile = path.join(workDir, `${className}.java`);
      fs.writeFileSync(srcFile, code || '', 'utf-8');

      exec(`javac "${srcFile}"`, { timeout: 10000 }, (compileErr, _stdout, compileStderr) => {
        if (compileErr) {
          const duration = Date.now() - startTime;
          cleanUp();
          const errText = compileStderr || compileErr.message;
          return res.json({
            success: false,
            exitCode: 1,
            stdout: [],
            stderr: [errText],
            durationMs: duration,
            error: { message: errText }
          });
        }

        exec(`java -cp "${workDir}" ${className}`, { timeout: 10000, maxBuffer: 1024 * 1024 }, (runErr, runStdout, runStderr) => {
          const duration = Date.now() - startTime;
          cleanUp();
          res.json({
            success: !runErr,
            exitCode: runErr ? (runErr.code ?? 1) : 0,
            stdout: runStdout ? runStdout.split(/\r?\n/) : [],
            stderr: runStderr ? runStderr.split(/\r?\n/) : [],
            durationMs: duration,
            error: runErr ? { message: runStderr || runErr.message } : undefined
          });
        });
      });
      return;
    }

    res.status(400).json({ error: `Unsupported native language: ${language}` });
  } catch (err: any) {
    cleanUp();
    res.status(500).json({ error: err.message || 'Execution failed' });
  }
});

app.listen(PORT, () => {
  console.log(`[CodePilot Server] API running on http://localhost:${PORT}`);
});
