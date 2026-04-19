import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

const components: Components = {
  // Links: always open in new tab with security attributes
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
    >
      {children}
    </a>
  ),

  // Headings
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-6 mb-3 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-3 border-b border-gray-200 dark:border-gray-700 pb-1">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-3 mb-1">
      {children}
    </h4>
  ),

  // Paragraphs
  p: ({ children }) => (
    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      {children}
    </p>
  ),

  // Lists
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-5 mb-4 space-y-1 text-gray-700 dark:text-gray-300">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-5 mb-4 space-y-1 text-gray-700 dark:text-gray-300">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),

  // Tables with striped rows
  table: ({ children }) => (
    <div className="overflow-x-auto mb-4">
      <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {children}
    </tbody>
  ),
  tr: ({ children }) => (
    <tr className="even:bg-gray-50 dark:even:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
      {children}
    </td>
  ),

  // Code blocks
  code: ({ children, className }) => {
    const isBlock = className?.startsWith('language-');
    if (isBlock) {
      return (
        <code className="block bg-gray-100 dark:bg-gray-800 rounded p-3 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto">
          {children}
        </code>
      );
    }
    return (
      <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-sm font-mono text-gray-800 dark:text-gray-200">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto">{children}</pre>
  ),

  // Blockquote
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-400 dark:border-blue-600 pl-4 my-4 text-gray-600 dark:text-gray-400 italic">
      {children}
    </blockquote>
  ),

  // Horizontal rule
  hr: () => (
    <hr className="my-6 border-gray-200 dark:border-gray-700" />
  ),

  // Bold / italic
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-gray-700 dark:text-gray-300">{children}</em>
  ),
};

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose-reset max-w-none">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
