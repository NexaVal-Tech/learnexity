import Head from "next/head";
import { useState } from "react";
import CodeEditor from "@/components/codeeditor/CodeEditor";

type Language = "html" | "css" | "javascript" | "python" | "sql";

const FEATURED_SNIPPETS: { title: string; language: Language; description: string; code: string }[] = [
  {
    title: "Animated Button",
    language: "html",
    description: "CSS hover animation",
    code: `<!DOCTYPE html>
<html>
<head>
<style>
  body { display:flex; justify-content:center; align-items:center; height:100vh; margin:0; background:#0f0f17; }
  .btn {
    padding: 14px 32px;
    background: #4A3AFF;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    font-family: sans-serif;
  }
  .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(74,58,255,0.5);
  }
  .btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.15);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s;
  }
  .btn:hover::after { transform: scaleX(1); }
</style>
</head>
<body>
  <button class="btn">Hover Me ✨</button>
</body>
</html>`,
  },
  {
    title: "List Comprehension",
    language: "python",
    description: "Python list operations",
    code: `# Python List Comprehensions
numbers = range(1, 11)

# Squares of even numbers
evens_squared = [n**2 for n in numbers if n % 2 == 0]
print("Even squares:", evens_squared)

# FizzBuzz with comprehension
fizzbuzz = [
    "FizzBuzz" if n % 15 == 0 else
    "Fizz" if n % 3 == 0 else
    "Buzz" if n % 5 == 0 else str(n)
    for n in range(1, 21)
]
print("FizzBuzz:", fizzbuzz)

# Nested comprehension
matrix = [[i * j for j in range(1, 4)] for i in range(1, 4)]
for row in matrix:
    print(row)`,
  },
  {
    title: "JOIN Query",
    language: "sql",
    description: "SQL table joins",
    code: `-- SQL JOIN Example
CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  title TEXT,
  instructor_id INTEGER
);

CREATE TABLE instructors (
  id INTEGER PRIMARY KEY,
  name TEXT,
  specialty TEXT
);

INSERT INTO instructors VALUES (1, 'Dr. Adaeze', 'AI & ML');
INSERT INTO instructors VALUES (2, 'Emeka Obi', 'Web Dev');
INSERT INTO instructors VALUES (3, 'Ngozi Eze', 'UI/UX');

INSERT INTO courses VALUES (1, 'Intro to AI', 1);
INSERT INTO courses VALUES (2, 'React Masterclass', 2);
INSERT INTO courses VALUES (3, 'Figma for Beginners', 3);
INSERT INTO courses VALUES (4, 'Advanced ML', 1);

SELECT c.title AS Course, i.name AS Instructor, i.specialty
FROM courses c
JOIN instructors i ON c.instructor_id = i.id
ORDER BY i.name;`,
  },
  {
    title: "DOM Manipulation",
    language: "javascript",
    description: "Console array tricks",
    code: `// JavaScript Array Methods
const courses = [
  { name: "Web Dev", students: 120, rating: 4.8 },
  { name: "Data Analytics", students: 85, rating: 4.6 },
  { name: "UI/UX Design", students: 95, rating: 4.9 },
  { name: "AI & ML", students: 140, rating: 4.7 },
];

// Sort by rating
const topRated = [...courses].sort((a, b) => b.rating - a.rating);
console.log("Top Rated Courses:");
topRated.forEach(c => console.log(\`  \${c.name}: ⭐ \${c.rating}\`));

// Total students
const total = courses.reduce((sum, c) => sum + c.students, 0);
console.log("\\nTotal Students:", total);

// Filter popular
const popular = courses.filter(c => c.students > 100);
console.log("\\nPopular Courses (>100 students):");
popular.forEach(c => console.log(\`  \${c.name}: \${c.students} students\`));`,
  },
];

export default function EditorPage() {
  const [activeSnippet, setActiveSnippet] = useState<null | typeof FEATURED_SNIPPETS[0]>(null);
  const [editorKey, setEditorKey] = useState(0);

  const loadSnippet = (snippet: typeof FEATURED_SNIPPETS[0]) => {
    setActiveSnippet(snippet);
    setEditorKey(k => k + 1);
  };

  return (
    <>
      <Head>
        <title>Code Editor | Learnexity</title>
        <meta name="description" content="Write and run HTML, CSS, JavaScript, Python, and SQL directly in your browser." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight: "100vh", background: "#080811", fontFamily: "'Inter', sans-serif", color: "#e2e8f0" }}>
        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #0f0f1a 0%, #13102a 100%)", borderBottom: "1px solid #1e1e30", padding: "48px 24px 40px" }}>
          <div style={{ maxWidth: "1230px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ background: "#4A3AFF", borderRadius: "8px", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>⚡</div>
              <span style={{ color: "#818cf8", fontSize: "13px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Live Code Editor</span>
            </div>
            <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, margin: "0 0 12px", lineHeight: 1.2 }}>
              Write, Run & Learn<br />
              <span style={{ background: "linear-gradient(90deg, #4A3AFF, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Directly in Your Browser
              </span>
            </h1>
            <p style={{ color: "#6b7280", fontSize: "15px", margin: "0 0 28px", maxWidth: "560px" }}>
              No setup required. Write HTML, CSS, JavaScript, Python, and SQL — all powered by WebAssembly, running entirely on your machine.
            </p>

            {/* Feature pills */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { icon: "🌐", label: "HTML/CSS/JS — Instant preview" },
                { icon: "🐍", label: "Python — Pyodide WASM" },
                { icon: "🗄️", label: "SQL — SQLite in-browser" },
                { icon: "⌨️", label: "Ctrl+Enter to run" },
                { icon: "↔️", label: "Resizable split pane" },
              ].map(f => (
                <div key={f.label} style={{ background: "rgba(74,58,255,0.1)", border: "1px solid rgba(74,58,255,0.25)", borderRadius: "20px", padding: "5px 14px", fontSize: "12px", color: "#818cf8", fontWeight: 500 }}>
                  {f.icon} {f.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: "1230px", margin: "0 auto", padding: "32px 24px" }}>
          {/* Starter snippets */}
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 12px" }}>
              Starter Examples
            </h2>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {FEATURED_SNIPPETS.map(snippet => (
                <button
                  key={snippet.title}
                  onClick={() => loadSnippet(snippet)}
                  style={{
                    background: activeSnippet?.title === snippet.title ? "#4A3AFF" : "#13131f",
                    border: `1px solid ${activeSnippet?.title === snippet.title ? "#4A3AFF" : "#1e1e30"}`,
                    borderRadius: "8px", padding: "8px 16px", cursor: "pointer",
                    color: activeSnippet?.title === snippet.title ? "#fff" : "#9ca3af",
                    fontSize: "13px", fontWeight: 600, transition: "all 0.15s",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {snippet.title}
                  <span style={{ marginLeft: "6px", opacity: 0.6, fontSize: "11px" }}>{snippet.description}</span>
                </button>
              ))}
              <button
                onClick={() => { setActiveSnippet(null); setEditorKey(k => k + 1); }}
                style={{
                  background: "transparent", border: "1px solid #1e1e30", borderRadius: "8px",
                  padding: "8px 14px", cursor: "pointer", color: "#4b5563", fontSize: "12px",
                  fontFamily: "'JetBrains Mono', monospace", transition: "all 0.15s",
                }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* The Editor */}
          <CodeEditor
            key={editorKey}
            initialCode={activeSnippet?.code}
            initialLanguage={activeSnippet?.language ?? "html"}
            height="520px"
            showHeader={true}
          />

          {/* Tips */}
          <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            {[
              { icon: "⌨️", tip: "Ctrl + Enter", desc: "Run your code instantly" },
              { icon: "⇥", tip: "Tab", desc: "Indent with 2 spaces" },
              { icon: "↔️", tip: "Drag divider", desc: "Resize editor/output panes" },
              { icon: "🔄", tip: "Switch languages", desc: "Code persists per language" },
            ].map(t => (
              <div key={t.tip} style={{ background: "#0d0d1a", border: "1px solid #1e1e30", borderRadius: "8px", padding: "12px 16px", display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "20px" }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace" }}>{t.tip}</div>
                  <div style={{ fontSize: "11px", color: "#4b5563" }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}