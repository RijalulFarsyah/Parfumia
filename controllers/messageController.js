import { db } from '../models/database.js';
import {
  sendMessage as modelSendMessage,
  getConversation,
  markAsRead,
  listUserConversations,
} from '../models/messages.js';
import { requireAuth } from '../middlewares/auth.js';

export function sendMessageController(req, res) {
  const { senderId, receiverId, orderId, content } = req.body ?? {};
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  if (!receiverId || !content) {
    return res.status(400).json({ error: 'receiverId and content are required' });
  }
  const order = db.prepare('SELECT id FROM orders WHERE id = ?').get(orderId);
  if (!order) return res.status(400).json({ error: 'Invalid order' });

  const isParticipant = order.buyer_id === userId || order.store_id === userId;
  if (!isParticipant) {
    return res.status(403).json({ error: 'Chat is only allowed between users sharing an order' });
  }

  const message = modelSendMessage({ senderId: userId, receiverId, orderId, content });
  res.status(201).json({ message });
}

export function getConversationController(req, res) {
  const { userId, otherUserId } = req.params;
  if (!userId || !otherUserId) return res.status(400).json({ error: 'userId and otherUserId are required' });
  if (parseInt(userId, 10) !== req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const messages = getConversation(parseInt(userId, 10), parseInt(otherUserId, 10));
  res.json({ messages });
}

export function listConversationsController(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  const conversations = listUserConversations(userId);
  res.json({ conversations });
}
