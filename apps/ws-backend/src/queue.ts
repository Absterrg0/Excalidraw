import prisma from "@repo/db";

interface Chat {
  message: string;
  userId: string;
  roomId: string;
}

export class ChatQueue {
  private queue: Chat[] = [];
  private isProcessing: boolean = false;
  private processIntervalId: NodeJS.Timeout | null = null;

  constructor() {
    // Start processing messages every 2 seconds
    this.processIntervalId = setInterval(() => this.processQueue(), 2000);
    console.log("Chat queue initialized with automatic processing");
  }

  addChat(chat: Chat) {
    console.log("Adding chat to queue:", chat);
    this.queue.push(chat);
    
    // If queue gets big (more than 10 messages), process immediately
    if (this.queue.length > 10 && !this.isProcessing) {
      this.processQueue();
    }
  }

  getNextMessage() {
    const chat = this.queue.shift();
    console.log("Retrieving chat from queue:", chat);
    return chat;
  }

  isEmpty() {
    console.log("Queue empty check:", this.queue.length === 0);
    return this.queue.length === 0;
  }

  async processQueue() {
    // Don't process if already processing or queue is empty
    if (this.isProcessing || this.isEmpty()) {
      return;
    }

    this.isProcessing = true;
    console.log(`Starting to process ${this.queue.length} messages`);

    try {
      // Get all messages currently in the queue (up to 20 at a time)
      const messagesToProcess = this.queue.splice(0, 20);
      
      // Store all messages in database
      await prisma.$transaction(
        messagesToProcess.map(chat => 
          prisma.chat.create({
            data: {
              message: chat.message,
              userId: chat.userId,
              roomId: chat.roomId,
            }
          })
        )
      );
      
      console.log(`Successfully stored ${messagesToProcess.length} messages in database`);
    } catch (error) {
      console.error("Error storing messages in database:", error);
      // In a production system, you might want to add the messages back to the queue
      // or store them in a "failed messages" collection
    } finally {
      this.isProcessing = false;
    }
  }

  // Call this when shutting down your server
  async shutdown() {
    console.log("Shutting down chat queue...");
    if (this.processIntervalId) {
      clearInterval(this.processIntervalId);
    }
    
    // Process any remaining messages before shutdown
    if (!this.isEmpty()) {
      await this.processQueue();
    }
    console.log("Chat queue shutdown complete");
  }
  
  // For monitoring and debugging
  getQueueLength() {
    return this.queue.length;
  }
}

export const chatQueue = new ChatQueue();