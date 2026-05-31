"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";

type Language = "html" | "css" | "javascript" | "python" | "sql";

interface CodeEditorProps {
  initialCode?: string;
  initialLanguage?: Language;
  height?: string;
  showHeader?: boolean;
  lessonTitle?: string;
}

const LANGUAGE_DEFAULTS: Record<Language, string> = {
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Page</title>
  <style>
    body {
      font-family: sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: #f0f4ff;
    }
    h1 { color: #4A3AFF; }
  </style>
</head>
<body>
  <h1>Hello, Learnexity! 🚀</h1>
</body>
</html>`,
  css: `/* CSS Playground */
body {
  font-family: sans-serif;
  background: #f0f4ff;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

.card {
  background: white;
  border-radius: 1rem;
  padding: 2rem 3rem;
  box-shadow: 0 4px 24px rgba(74, 58, 255, 0.15);
  text-align: center;
}

h1 {
  color: #4A3AFF;
  margin: 0;
}`,
  javascript: `// JavaScript Playground
const greet = (name) => {
  return \`Hello, \${name}! Welcome to Learnexity.\`;
};

console.log(greet("Student"));

// Try some array methods
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);

const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log("Sum:", sum);`,
  python: `# Python Playground
# Powered by Pyodide (runs in your browser!)

def greet(name):
    return f"Hello, {name}! Welcome to Learnexity."

print(greet("Student"))

# Try some Python
numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print("Doubled:", doubled)

total = sum(numbers)
print("Sum:", total)

# Fibonacci
def fibonacci(n):
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

print("Fibonacci(8):", fibonacci(8))`,
  sql: `-- SQL Playground
-- Powered by sql.js (SQLite in your browser!)

-- Create a table
CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  course TEXT,
  score INTEGER
);

-- Insert data
INSERT INTO students VALUES (1, 'Alice', 'Web Development', 92);
INSERT INTO students VALUES (2, 'Bob', 'Data Analytics', 88);
INSERT INTO students VALUES (3, 'Carol', 'UI/UX Design', 95);
INSERT INTO students VALUES (4, 'David', 'AI & Machine Learning', 79);
INSERT INTO students VALUES (5, 'Eve', 'Web Development', 84);

-- Query
SELECT name, course, score
FROM students
ORDER BY score DESC;`,
};

const LANG_META: Record<Language, { label: string; color: string; icon: string }> = {
  html: { label: "HTML", color: "#E34F26", icon: "🌐" },
  css: { label: "CSS", color: "#1572B6", icon: "🎨" },
  javascript: { label: "JavaScript", color: "#F7DF1E", icon: "⚡" },
  python: { label: "Python", color: "#3776AB", icon: "🐍" },
  sql: { label: "SQL", color: "#336791", icon: "🗄️" },
};

// Syntax highlighting (simple tokenizer)
function highlight(code: string, lang: Language): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  if (lang === "html") {
    return esc(code)
      .replace(/(&lt;\/?[\w\s="'.:/-]+?&gt;)/g, '<span style="color:#7dd3fc">$1</span>')
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span style="color:#6b7280;font-style:italic">$1</span>');
  }
  if (lang === "css") {
    return esc(code)
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6b7280;font-style:italic">$1</span>')
      .replace(/([.#]?[\w-]+)\s*\{/g, '<span style="color:#86efac">$1</span>{')
      .replace(/:([\w-]+)/g, ':<span style="color:#c4b5fd">$1</span>')
      .replace(/([\w-]+)\s*:/g, '<span style="color:#7dd3fc">$1</span>:');
  }
  if (lang === "javascript") {
    return esc(code)
      .replace(/(\/\/.*)/g, '<span style="color:#6b7280;font-style:italic">$1</span>')
      .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|default|new|this|typeof|=>)\b/g, '<span style="color:#c4b5fd">$1</span>')
      .replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g, '<span style="color:#fb923c">$1</span>')
      .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span style="color:#86efac">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#fb923c">$1</span>');
  }
  if (lang === "python") {
    return esc(code)
      .replace(/(#.*)/g, '<span style="color:#6b7280;font-style:italic">$1</span>')
      .replace(/\b(def|class|import|from|return|if|elif|else|for|while|in|not|and|or|True|False|None|print|range|len|str|int|float|list|dict|tuple|set)\b/g, '<span style="color:#c4b5fd">$1</span>')
      .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span style="color:#86efac">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#fb923c">$1</span>');
  }
  if (lang === "sql") {
    return esc(code)
      .replace(/(--.*)/g, '<span style="color:#6b7280;font-style:italic">$1</span>')
      .replace(/\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|CREATE|TABLE|DROP|UPDATE|SET|DELETE|ORDER|BY|GROUP|HAVING|JOIN|LEFT|RIGHT|INNER|ON|AS|AND|OR|NOT|IN|LIKE|BETWEEN|IS|NULL|PRIMARY|KEY|INTEGER|TEXT|REAL|BOOLEAN|UNIQUE|DEFAULT|INDEX|DISTINCT|LIMIT|OFFSET|COUNT|SUM|AVG|MIN|MAX)\b/gi, '<span style="color:#c4b5fd">$1</span>')
      .replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color:#86efac">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#fb923c">$1</span>');
  }
  return esc(code);
}

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<any>;
    pyodide: any;
    initSqlJs: (config: { locateFile: (f: string) => string }) => Promise<any>;
    SQL: any;
  }
}

export default function CodeEditor({
  initialCode,
  initialLanguage = "html",
  height = "480px",
  showHeader = true,
  lessonTitle,
}: CodeEditorProps) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [codes, setCodes] = useState<Record<Language, string>>({
    html: LANGUAGE_DEFAULTS.html,
    css: LANGUAGE_DEFAULTS.css,
    javascript: LANGUAGE_DEFAULTS.javascript,
    python: LANGUAGE_DEFAULTS.python,
    sql: LANGUAGE_DEFAULTS.sql,
  });
  const [output, setOutput] = useState<string>("");
  const [outputType, setOutputType] = useState<"preview" | "console">("preview");
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideStatus, setPyodideStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [sqlStatus, setSqlStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [consoleLogs, setConsoleLogs] = useState<{ type: string; text: string }[]>([]);
  const [splitRatio, setSplitRatio] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [lineCount, setLineCount] = useState(1);
  const [scrollTop, setScrollTop] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const currentCode = codes[language];

  // Initialize language
  useEffect(() => {
    if (initialCode) {
      setCodes(prev => ({ ...prev, [initialLanguage]: initialCode }));
    }
  }, []);

  // Sync pre scroll with textarea scroll
  const syncScroll = useCallback(() => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      }
      setScrollTop(textareaRef.current.scrollTop);
    }
  }, []);

  const updateCode = useCallback((val: string) => {
    setCodes(prev => ({ ...prev, [language]: val }));
    setLineCount(val.split("\n").length);
  }, [language]);

  useEffect(() => {
    setLineCount(currentCode.split("\n").length);
  }, [language, currentCode]);

  // Load Pyodide
  const loadPyodide = useCallback(async () => {
    if (window.pyodide || pyodideStatus === "ready") return;
    setPyodideStatus("loading");
    try {
      if (!document.querySelector('script[src*="pyodide"]')) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js";
          s.onload = () => resolve();
          s.onerror = () => reject();
          document.head.appendChild(s);
        });
      }
      window.pyodide = await window.loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/" });
      setPyodideStatus("ready");
    } catch {
      setPyodideStatus("error");
    }
  }, [pyodideStatus]);

  // Load sql.js
  const loadSql = useCallback(async () => {
    if (window.SQL || sqlStatus === "ready") return;
    setSqlStatus("loading");
    try {
      if (!document.querySelector('script[src*="sql-wasm"]')) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js";
          s.onload = () => resolve();
          s.onerror = () => reject();
          document.head.appendChild(s);
        });
      }
      window.SQL = await window.initSqlJs({
        locateFile: (f: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${f}`,
      });
      setSqlStatus("ready");
    } catch {
      setSqlStatus("error");
    }
  }, [sqlStatus]);

  useEffect(() => {
    if (language === "python") loadPyodide();
    if (language === "sql") loadSql();
  }, [language]);

  const runCode = useCallback(async () => {
    setIsRunning(true);
    setConsoleLogs([]);

    try {
      if (language === "html") {
        setOutputType("preview");
        setOutput(currentCode);
      } else if (language === "css") {
        setOutputType("preview");
        const wrapped = `<!DOCTYPE html><html><head><style>${currentCode}</style></head><body>
          <div class="card"><h1>CSS Preview</h1><p>Style applied successfully!</p></div>
        </body></html>`;
        setOutput(wrapped);
      } else if (language === "javascript") {
        setOutputType("console");
        const logs: { type: string; text: string }[] = [];
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        document.body.appendChild(iframe);
        const iframeWindow = iframe.contentWindow as any;
        iframeWindow.console = {
          log: (...args: any[]) => logs.push({ type: "log", text: args.map(String).join(" ") }),
          error: (...args: any[]) => logs.push({ type: "error", text: args.map(String).join(" ") }),
          warn: (...args: any[]) => logs.push({ type: "warn", text: args.map(String).join(" ") }),
          info: (...args: any[]) => logs.push({ type: "info", text: args.map(String).join(" ") }),
        };
        try {
          iframeWindow.eval(currentCode);
        } catch (e: any) {
          logs.push({ type: "error", text: `❌ ${e.message}` });
        }
        document.body.removeChild(iframe);
        setConsoleLogs(logs);
      } else if (language === "python") {
        setOutputType("console");
        if (!window.pyodide) {
          setConsoleLogs([{ type: "error", text: "Pyodide not loaded yet. Please wait..." }]);
          return;
        }
        const logs: { type: string; text: string }[] = [];
        window.pyodide.setStdout({ batched: (s: string) => logs.push({ type: "log", text: s }) });
        window.pyodide.setStderr({ batched: (s: string) => logs.push({ type: "error", text: s }) });
        try {
          await window.pyodide.runPythonAsync(currentCode);
        } catch (e: any) {
          logs.push({ type: "error", text: `❌ ${e.message}` });
        }
        setConsoleLogs(logs);
      } else if (language === "sql") {
        setOutputType("console");
        if (!window.SQL) {
          setConsoleLogs([{ type: "error", text: "sql.js not loaded yet. Please wait..." }]);
          return;
        }
        const logs: { type: string; text: string }[] = [];
        try {
          const db = new window.SQL.Database();
          const statements = currentCode.split(";").map((s: string) => s.trim()).filter(Boolean);
          for (const stmt of statements) {
            try {
              const results = db.exec(stmt + ";");
              if (results.length > 0) {
                for (const res of results) {
                  const header = res.columns.join(" | ");
                  const divider = res.columns.map(() => "---").join("-|-");
                  logs.push({ type: "header", text: header });
                  logs.push({ type: "divider", text: divider });
                  for (const row of res.values) {
                    logs.push({ type: "row", text: row.join(" | ") });
                  }
                  logs.push({ type: "info", text: `✅ ${res.values.length} row(s) returned` });
                }
              } else {
                logs.push({ type: "success", text: `✅ Query executed successfully` });
              }
            } catch (e: any) {
              logs.push({ type: "error", text: `❌ ${e.message}` });
            }
          }
          db.close();
        } catch (e: any) {
          logs.push({ type: "error", text: `❌ ${e.message}` });
        }
        setConsoleLogs(logs);
      }
    } finally {
      setIsRunning(false);
    }
  }, [language, currentCode]);

  // Keyboard shortcut: Ctrl+Enter / Cmd+Enter
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runCode();
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current!;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = currentCode.substring(0, start) + "  " + currentCode.substring(end);
      updateCode(newVal);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  }, [runCode, currentCode, updateCode]);

  // Drag to resize
  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const ratio = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitRatio(Math.max(25, Math.min(75, ratio)));
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [isDragging]);

  const getStatusLabel = () => {
    if (language === "python") {
      if (pyodideStatus === "loading") return "⏳ Loading Python runtime...";
      if (pyodideStatus === "error") return "❌ Failed to load Python";
      if (pyodideStatus === "ready") return "🐍 Python ready";
    }
    if (language === "sql") {
      if (sqlStatus === "loading") return "⏳ Loading SQLite runtime...";
      if (sqlStatus === "error") return "❌ Failed to load SQLite";
      if (sqlStatus === "ready") return "🗄️ SQLite ready";
    }
    return null;
  };

  const statusLabel = getStatusLabel();

  return (
    <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", background: "#0f0f17", borderRadius: "12px", overflow: "hidden", border: "1px solid #1e1e30", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
      {/* Header */}
      {showHeader && (
        <div style={{ background: "#13131f", borderBottom: "1px solid #1e1e30", padding: "10px 16px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: "6px" }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
            ))}
          </div>
          {lessonTitle && <span style={{ color: "#6b7280", fontSize: "12px", flex: 1 }}>{lessonTitle}</span>}
          {/* Language tabs */}
          <div style={{ display: "flex", gap: "4px", marginLeft: "auto", background: "#0f0f17", borderRadius: "8px", padding: "3px" }}>
            {(Object.keys(LANG_META) as Language[]).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                style={{
                  padding: "4px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600,
                  background: language === lang ? "#4A3AFF" : "transparent",
                  color: language === lang ? "#fff" : "#6b7280",
                  transition: "all 0.15s",
                  fontFamily: "inherit",
                }}
              >
                {LANG_META[lang].icon} {LANG_META[lang].label}
              </button>
            ))}
          </div>
          {/* Run button */}
          <button
            onClick={runCode}
            disabled={isRunning || (language === "python" && pyodideStatus === "loading") || (language === "sql" && sqlStatus === "loading")}
            style={{
              background: isRunning ? "#2d2d44" : "#4A3AFF", color: "white", border: "none", borderRadius: "7px",
              padding: "6px 16px", cursor: isRunning ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 700,
              display: "flex", alignItems: "center", gap: "6px", transition: "all 0.15s", fontFamily: "inherit",
              boxShadow: isRunning ? "none" : "0 0 12px rgba(74,58,255,0.4)",
            }}
          >
            {isRunning ? "⏳ Running..." : "▶ Run"}
            <span style={{ fontSize: "10px", opacity: 0.7 }}>Ctrl+↵</span>
          </button>
        </div>
      )}

      {/* Status bar */}
      {statusLabel && (
        <div style={{ background: "#0d1117", padding: "4px 16px", fontSize: "11px", color: "#6b7280", borderBottom: "1px solid #1e1e30" }}>
          {statusLabel}
        </div>
      )}

      {/* Editor + Output split */}
      <div ref={containerRef} style={{ display: "flex", height, cursor: isDragging ? "col-resize" : "default" }}>
        {/* Editor pane */}
        <div style={{ width: `${splitRatio}%`, display: "flex", flexDirection: "column", position: "relative", borderRight: "2px solid #1e1e30" }}>
          <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
            {/* Line numbers */}
            <div
              ref={lineNumbersRef}
              style={{
                width: "44px", background: "#0d0d1a", color: "#3d3d5c", fontSize: "13px",
                lineHeight: "1.6", padding: "14px 8px 14px 0", textAlign: "right",
                userSelect: "none", overflow: "hidden", flexShrink: 0,
                borderRight: "1px solid #1e1e30",
              }}
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} style={{ paddingRight: "8px" }}>{i + 1}</div>
              ))}
            </div>
            {/* Code area */}
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              {/* Highlighted layer */}
              <pre
                ref={preRef}
                aria-hidden="true"
                style={{
                  position: "absolute", inset: 0, margin: 0, padding: "14px 16px",
                  fontSize: "13px", lineHeight: "1.6", color: "#e2e8f0",
                  fontFamily: "inherit", whiteSpace: "pre", overflow: "hidden",
                  pointerEvents: "none", background: "transparent",
                  tabSize: 2,
                }}
                dangerouslySetInnerHTML={{ __html: highlight(currentCode, language) + "\n" }}
              />
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={currentCode}
                onChange={e => updateCode(e.target.value)}
                onKeyDown={handleKeyDown}
                onScroll={syncScroll}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                style={{
                  position: "absolute", inset: 0, width: "100%", height: "100%",
                  margin: 0, padding: "14px 16px", fontSize: "13px", lineHeight: "1.6",
                  fontFamily: "inherit", color: "transparent", caretColor: "#a78bfa",
                  background: "transparent", border: "none", outline: "none", resize: "none",
                  whiteSpace: "pre", overflow: "auto", tabSize: 2,
                }}
              />
            </div>
          </div>
          {/* Editor footer */}
          <div style={{ background: "#0d0d1a", borderTop: "1px solid #1e1e30", padding: "4px 12px", display: "flex", gap: "16px", fontSize: "11px", color: "#3d3d5c" }}>
            <span>{LANG_META[language].icon} {LANG_META[language].label}</span>
            <span>Lines: {lineCount}</span>
            <span>Chars: {currentCode.length}</span>
          </div>
        </div>

        {/* Drag divider */}
        <div
          onMouseDown={handleDividerMouseDown}
          style={{
            width: "4px", background: isDragging ? "#4A3AFF" : "transparent",
            cursor: "col-resize", flexShrink: 0, transition: "background 0.15s",
            zIndex: 10,
          }}
        />

        {/* Output pane */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0a0a14" }}>
          {/* Output tabs */}
          <div style={{ background: "#13131f", borderBottom: "1px solid #1e1e30", padding: "0 12px", display: "flex", gap: "2px", alignItems: "center" }}>
            {(["preview", "console"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setOutputType(tab)}
                style={{
                  padding: "8px 14px", border: "none", borderBottom: tab === outputType ? "2px solid #4A3AFF" : "2px solid transparent",
                  background: "transparent", color: tab === outputType ? "#4A3AFF" : "#6b7280",
                  cursor: "pointer", fontSize: "12px", fontWeight: 600, fontFamily: "inherit",
                  textTransform: "capitalize", transition: "all 0.15s",
                }}
              >
                {tab === "preview" ? "🌐 Preview" : "> Console"}
              </button>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
              <button
                onClick={() => setConsoleLogs([])}
                style={{ background: "transparent", border: "none", color: "#3d3d5c", cursor: "pointer", fontSize: "11px", padding: "4px 8px" }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Output content */}
          <div style={{ flex: 1, overflow: "auto" }}>
            {outputType === "preview" ? (
              language === "html" || language === "css" ? (
                output ? (
                  <iframe
                    ref={iframeRef}
                    srcDoc={output}
                    sandbox="allow-scripts"
                    style={{ width: "100%", height: "100%", border: "none", background: "white" }}
                    title="Preview"
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#3d3d5c", gap: "8px" }}>
                    <span style={{ fontSize: "32px" }}>▶</span>
                    <span style={{ fontSize: "13px" }}>Click Run to preview</span>
                  </div>
                )
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#3d3d5c", gap: "8px" }}>
                  <span style={{ fontSize: "24px" }}>{">"}_</span>
                  <span style={{ fontSize: "13px" }}>Switch to Console tab for {LANG_META[language].label} output</span>
                </div>
              )
            ) : (
              <div style={{ padding: "12px 16px", fontFamily: "inherit", fontSize: "13px" }}>
                {consoleLogs.length === 0 ? (
                  <div style={{ color: "#3d3d5c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", gap: "8px" }}>
                    <span style={{ fontSize: "24px" }}>{">"}_</span>
                    <span>Run your code to see output here</span>
                  </div>
                ) : (
                  consoleLogs.map((log, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        marginBottom: "2px",
                        color:
                          log.type === "error" ? "#f87171" :
                          log.type === "warn" ? "#fb923c" :
                          log.type === "success" ? "#4ade80" :
                          log.type === "header" ? "#a78bfa" :
                          log.type === "divider" ? "#3d3d5c" :
                          log.type === "row" ? "#7dd3fc" :
                          log.type === "info" ? "#818cf8" :
                          "#e2e8f0",
                        background:
                          log.type === "error" ? "rgba(248,113,113,0.08)" :
                          log.type === "warn" ? "rgba(251,146,60,0.08)" :
                          "transparent",
                        borderLeft: log.type === "error" ? "3px solid #f87171" :
                          log.type === "warn" ? "3px solid #fb923c" : "3px solid transparent",
                        fontWeight: log.type === "header" ? 700 : 400,
                        letterSpacing: log.type === "header" ? "0.05em" : "normal",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                      }}
                    >
                      {log.type === "error" ? "✗ " : log.type === "warn" ? "⚠ " : log.type === "log" || log.type === "row" ? "> " : ""}
                      {log.text}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}