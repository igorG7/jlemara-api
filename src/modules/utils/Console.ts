// /src/lib/console.ts
import fs from "fs";
import path from "path";

type LogType = "log" | "error" | "warn" | "success";

export default function Console({
  type,
  message,
}: {
  type: LogType;
  message: string;
}) {
  const timestamp = `[📆 ${new Date().toLocaleDateString(
    "pt-BR",
  )} ⏰ ${new Date().toLocaleTimeString("pt-BR")}]`;

  const icons: Record<LogType, string> = {
    error: "❌",
    warn: "⚠️",
    success: "✅",
    log: "ℹ️",
  };

  const logLine = `${timestamp} ${icons[type]} ${message} ${icons[type]}`;

  // sempre mostra no console
  console.log(logLine);

  // monta objeto
  const logEntry = {
    type,
    message,
    timestamp:
      new Date().toLocaleDateString("pt-BR") +
      " " +
      new Date().toLocaleTimeString("pt-BR"),
  };

  // caminho do arquivo
  //  const logDir = path.join(process.cwd(), "src", "logs");
  //  const defaultLogPath = path.join(logDir, "defaultLog.json");
  //  const specificLogPath = path.join(logDir, `${type}Log.json`);

  /*  // salva no arquivo default
     appendToJson(defaultLogPath, logEntry);
 
     // salva também no específico (errorLog.json, warnLog.json, etc.)
     appendToJson(specificLogPath, logEntry); */
}

export function ConsoleData({ type, data }: { type: LogType; data: any }) {
  const timestamp = `[${new Date().toLocaleDateString(
    "pt-BR",
  )} ${new Date().toLocaleTimeString("pt-BR")}]`;

  const icons: Record<LogType, string> = {
    error: "❌",
    warn: "⚠️",
    success: "✅",
    log: "ℹ️",
  };

  const logLine = `${timestamp} ${icons[type]} ${JSON.stringify(data)} ${icons[type]}`;

  // sempre mostra no console
  console.log(logLine);

  // monta objeto
  const logEntry = {
    type,
    data,
    timestamp:
      new Date().toLocaleDateString("pt-BR") +
      " " +
      new Date().toLocaleTimeString("pt-BR"),
  };

  // caminho do arquivo
  // const logDir = path.join(process.cwd(), "src", "logs");
  // const defaultLogPath = path.join(logDir, "defaultLog.json");
  // const specificLogPath = path.join(logDir, `${type}Log.json`);

  // salva no arquivo default
  // appendToJson(defaultLogPath, logEntry);

  // salva também no específico (errorLog.json, warnLog.json, etc.)
  // appendToJson(specificLogPath, logEntry);
}
function appendToJson(filePath: string, logEntry: any) {
  try {
    // cria diretório se não existir
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    let logs: any[] = [];
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8");
      if (raw.trim().length > 0) logs = JSON.parse(raw);
    }
    logs.push(logEntry);
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2), "utf8");
  } catch (err) {
    console.error("Erro ao salvar log:", err);
  }
}
