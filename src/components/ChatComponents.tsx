import { marked } from "marked";

interface MessageProps {
  role: string;
  content: string;
  timestamp: string;
}

export const Message = ({ role, content, timestamp }: MessageProps) => (
  <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
    <div
      className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-lg p-3 ${
        role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
      }`}
    >
      <div className="whitespace-pre-wrap">
        <div dangerouslySetInnerHTML={{ __html: content }} />
        <p
          className={`flex ${role === "user" ? "justify-end" : "justify-start"} text-xs mt-3`}
        >
          {new Date(timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  </div>
);

export const TypingIndicator = () => (
  <div className="flex items-center space-x-1 rounded-lg px-3 py-2 max-w-max">
    {[0, 150, 300].map((delay) => (
      <div
        key={delay}
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: `${delay}ms` }}
      />
    ))}
  </div>
);
