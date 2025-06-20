import express, { Express, Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import config from "./config";
import { connectDB } from "./db";
import sequelize from "./db";
import appLogger from "./utils/Logger";
import { requestLogger, errorHandler } from "./middleware";
const swaggerUi = require("swagger-ui-express");
import swaggerDocument from "./swagger.json";

const app: Express = express();
const port = config.port || 5002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Connect to the database
connectDB();

app.get("/test-read", async (req: Request, res: Response) => {
  try {
    const [results, metadata] = await sequelize.query("SELECT 1");
    appLogger.info("Read operation successful", { results });
    res.json({ results });
  } catch (error: any) {
    appLogger.error("Read operation failed", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

app.post("/test-write", async (req: Request, res: Response) => {
  try {
    const [results, metadata] = await sequelize.query(
      "INSERT INTO test_table (name) VALUES ('test')"
    );
    appLogger.info("Write operation successful", { results });
    res.json({ results });
  } catch (error: any) {
    appLogger.error("Write operation failed", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@gmail.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
app.get("/api/v1/users", (req: Request, res: Response) => {
  appLogger.info("Fetching all users");
  res.json(users);
});

// add a new user
app.post("/api/v1/users", (req: Request, res: Response) => {
  const { name, email } = req.body;
  const newUser = {
    id: users.length + 1,
    name,
    email,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  users.push(newUser);
  appLogger.info("New user created", { user: newUser });
  res.status(201).json(newUser);
});

// Swagger setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req: Request, res: Response) => {
  appLogger.info("Root endpoint accessed");
  res.send("Hello from TypeScript Server!");
});

// Error handling middleware should be last
app.use(errorHandler);

app.listen(port, () => {
  appLogger.info(`Server is running at http://localhost:${port}`);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  appLogger.error("Uncaught Exception", {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  appLogger.error("Unhandled Rejection", { reason, promise });
  process.exit(1);
});

// File storage configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = "./uploads";
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 10, // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "video/mp4",
      "audio/mpeg",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// In-memory file storage (replace with database in production)
const fileDatabase: any[] = [];

// Helper function to get file category
const getFileCategory = (mimetype: string): string => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("audio/")) return "audio";
  if (
    mimetype.includes("pdf") ||
    mimetype.includes("document") ||
    mimetype.includes("text")
  )
    return "document";
  return "other";
};

// FILE ENDPOINTS

// Single file upload
app.post(
  "/api/v1/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileRecord = {
        id: uuidv4(),
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date().toISOString(),
        category: getFileCategory(req.file.mimetype),
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        metadata: req.body.metadata ? JSON.parse(req.body.metadata) : {},
        permissions: {
          isPublic: req.body.isPublic === "true",
          allowedUsers: [],
          expiresAt: null,
        },
        downloadUrl: `${req.protocol}://${req.get(
          "host"
        )}/api/v1/files/${uuidv4()}/download`,
        thumbnailUrl: req.file.mimetype.startsWith("image/")
          ? `${req.protocol}://${req.get(
              "host"
            )}/api/v1/files/${uuidv4()}/thumbnail`
          : null,
      };

      fileDatabase.push(fileRecord);
      appLogger.info("File uploaded successfully", { fileId: fileRecord.id });

      res.json(fileRecord);
    } catch (error: any) {
      appLogger.error("File upload failed", { error: error.message });
      res.status(500).json({ error: error.message });
    }
  }
);

// Multiple file upload
app.post(
  "/api/v1/upload/multiple",
  upload.array("files", 10),
  async (req: Request, res: Response) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const fileRecords = req.files.map((file: Express.Multer.File) => ({
        id: uuidv4(),
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        category: req.body.category || getFileCategory(file.mimetype),
        tags: req.body.tags || [],
        metadata: req.body.metadata ? JSON.parse(req.body.metadata) : {},
        permissions: {
          isPublic: req.body.isPublic === "true",
          allowedUsers: [],
          expiresAt: null,
        },
        downloadUrl: `${req.protocol}://${req.get(
          "host"
        )}/api/v1/files/${uuidv4()}/download`,
        thumbnailUrl: file.mimetype.startsWith("image/")
          ? `${req.protocol}://${req.get(
              "host"
            )}/api/v1/files/${uuidv4()}/thumbnail`
          : null,
      }));

      fileDatabase.push(...fileRecords);
      appLogger.info("Multiple files uploaded successfully", {
        count: fileRecords.length,
      });

      res.json(fileRecords);
    } catch (error: any) {
      appLogger.error("Multiple file upload failed", { error: error.message });
      res.status(500).json({ error: error.message });
    }
  }
);

// Download file by ID
app.get("/api/v1/files/:fileId", async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const fileRecord = fileDatabase.find((f) => f.id === fileId);

    if (!fileRecord) {
      return res.status(404).json({ error: "File not found" });
    }

    const filePath = path.join("./uploads", fileRecord.filename);

    try {
      await fs.access(filePath);
      appLogger.info("File downloaded", { fileId });
      res.download(filePath, fileRecord.originalName);
    } catch {
      res.status(404).json({ error: "File not found on disk" });
    }
  } catch (error: any) {
    appLogger.error("File download failed", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Get file metadata
app.get("/api/v1/files/:fileId/info", (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const fileRecord = fileDatabase.find((f) => f.id === fileId);

    if (!fileRecord) {
      return res.status(404).json({ error: "File not found" });
    }

    appLogger.info("File info retrieved", { fileId });
    res.json(fileRecord);
  } catch (error: any) {
    appLogger.error("File info retrieval failed", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Search files with complex filters
app.get("/api/v1/files/search", (req: Request, res: Response) => {
  try {
    const {
      query,
      fileTypes,
      category,
      sortBy = "uploadedAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    let filteredFiles = [...fileDatabase];

    // Filter by search query
    if (query) {
      filteredFiles = filteredFiles.filter(
        (file) =>
          file.originalName
            .toLowerCase()
            .includes((query as string).toLowerCase()) ||
          file.tags.some((tag: string) =>
            tag.toLowerCase().includes((query as string).toLowerCase())
          )
      );
    }

    // Filter by file types
    if (fileTypes) {
      const types = Array.isArray(fileTypes) ? fileTypes : [fileTypes];
      filteredFiles = filteredFiles.filter((file) =>
        types.some((type) => file.mimetype.includes(type))
      );
    }

    // Filter by category
    if (category) {
      filteredFiles = filteredFiles.filter(
        (file) => file.category === category
      );
    }

    // Sort files
    filteredFiles.sort((a, b) => {
      const aVal = a[sortBy as string];
      const bVal = b[sortBy as string];
      const order = sortOrder === "asc" ? 1 : -1;

      if (aVal < bVal) return -1 * order;
      if (aVal > bVal) return 1 * order;
      return 0;
    });

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

    appLogger.info("File search completed", {
      totalResults: filteredFiles.length,
      returnedResults: paginatedFiles.length,
    });

    res.json({
      files: paginatedFiles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredFiles.length,
        totalPages: Math.ceil(filteredFiles.length / limitNum),
      },
    });
  } catch (error: any) {
    appLogger.error("File search failed", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Delete file
app.delete("/api/v1/files/:fileId", async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const fileIndex = fileDatabase.findIndex((f) => f.id === fileId);

    if (fileIndex === -1) {
      return res.status(404).json({ error: "File not found" });
    }

    const fileRecord = fileDatabase[fileIndex];
    const filePath = path.join("./uploads", fileRecord.filename);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      appLogger.warn("File not found on disk during deletion", { fileId });
    }

    fileDatabase.splice(fileIndex, 1);
    appLogger.info("File deleted successfully", { fileId });

    res.json({ message: "File deleted successfully" });
  } catch (error: any) {
    appLogger.error("File deletion failed", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Get all files
app.get("/api/v1/files", (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedFiles = fileDatabase.slice(startIndex, endIndex);

    appLogger.info("Files retrieved", { count: paginatedFiles.length });

    res.json({
      files: paginatedFiles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: fileDatabase.length,
        totalPages: Math.ceil(fileDatabase.length / limitNum),
      },
    });
  } catch (error: any) {
    appLogger.error("File retrieval failed", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});
