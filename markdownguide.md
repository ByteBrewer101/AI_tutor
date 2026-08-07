# Markdown Rendering & Styling Guide

## Goal
We have markdown content (some from static app content, some from AI responses) that needs to be:
1. Rendered as properly styled HTML in the UI (not shown as raw markdown text).
2. Styled *differently* depending on whether it's a normal markdown block or an AI response.

## 1. Parsing markdown to HTML

Do not hand-roll markdown parsing with regex. Use a real parser + sanitizer.

### React
```bash
npm install react-markdown remark-gfm
```
```jsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function MarkdownView({ content }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
```
`remark-gfm` adds GitHub-flavored markdown support: tables, strikethrough, task lists, autolinks.

### Plain JS (no framework)
```bash
npm install marked dompurify
```
```js
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const html = DOMPurify.sanitize(marked.parse(markdownString));
container.innerHTML = html;
```

### Vue
Use `markdown-it`, paired with a sanitizer (e.g. `dompurify`), same pattern as above.

**Security rule:** Always sanitize before injecting into the DOM — even for "trusted" AI output. Prompt injection or unexpected content can produce markup we don't want rendered raw.

## 2. Base styling

Style the rendered output by targeting the semantic tags inside a wrapper class:

```css
.markdown-body h1, .markdown-body h2 { font-weight: 600; margin-top: 1.2em; }
.markdown-body code { background: #f3f3f3; padding: 2px 4px; border-radius: 4px; }
.markdown-body pre { background: #1e1e1e; color: #eee; padding: 12px; border-radius: 8px; overflow-x: auto; }
.markdown-body blockquote { border-left: 3px solid #ccc; padding-left: 12px; color: #666; }
```

Alternatively, use a prebuilt stylesheet like `github-markdown-css` for a GitHub-style look out of the box.

## 3. Differentiating AI responses from other markdown

Wrap content in a role-specific class instead of a single shared one:

```jsx
function ChatMessage({ role, content }) {
  return (
    <div className={role === 'assistant' ? 'markdown-ai' : 'markdown-user'}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
```

```css
.markdown-ai {
  background: #f7f8fa;
  border-radius: 12px;
  padding: 14px 16px;
}
.markdown-ai pre {
  background: #0d1117; /* darker code blocks specifically for AI answers */
}
.markdown-user {
  background: transparent;
}
```

For deeper customization (e.g. AI code blocks get a "copy" button, AI tables get special formatting), override individual element renderers instead of relying on CSS alone:

```jsx
<ReactMarkdown
  components={{
    code({ node, inline, className, children, ...props }) {
      return inline
        ? <code className="inline-code" {...props}>{children}</code>
        : <CodeBlockWithCopyButton {...props}>{children}</CodeBlockWithCopyButton>;
    }
  }}
>
  {content}
</ReactMarkdown>
```

## 4. Practical considerations

- **Streaming responses:** if AI output streams token-by-token, partial markdown (e.g. an unclosed code fence) can render incorrectly mid-stream. Buffer until a safe boundary, or use a streaming-aware markdown renderer.
- **Syntax highlighting:** pair the renderer with `react-syntax-highlighter` or `shiki` for code blocks.
- **Consistency:** keep one markdown parser across the app; mixing parsers (e.g. `marked` in one place, `markdown-it` elsewhere) can cause inconsistent rendering of edge cases (nested lists, tables, etc.).

## Summary checklist
- [ ] Install a markdown parser (`react-markdown` / `marked` / `markdown-it`)
- [ ] Add a sanitizer (`dompurify`) and never skip it
- [ ] Wrap rendered output in a semantic class (`.markdown-body`)
- [ ] Add a distinct class for AI messages (`.markdown-ai`) vs. other markdown (`.markdown-user` or similar)
- [ ] Style both base and role-specific classes with CSS
- [ ] Handle streaming edge cases if applicable
- [ ] Add syntax highlighting for code blocks if needed