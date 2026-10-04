import { db } from './database.js';

export function sendMessage({ senderId, receiverId, orderId, content }) {
  const info = db
    .prepare('INSERT INTO messages (sender_id, receiver_id, order_id, content) VALUES (?, ?, ?, ?)')
    .run(senderId, receiverId, orderId, content);
  return { id: info.lastInsertRowid, senderId, receiverId, orderId, content };
}

export function getConversation(userA, userB) {
  return db
    .prepare(
      `SELECT m.id, m.sender_id, m.receiver_id, m.order_id, m.content, m.is_read, m.created_at
       FROM messages m
       WHERE (m.sender_id = ? AND m.receiver_id = ?)
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`
    )
    .all(userA, userB, userB, userA);
}

export function markAsRead(id) {
  const info = db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?').run(id);
  return info.changes > 0;
}

export function listUserConversations(userId) {
  return db
    .prepare(
      `SELECT DISTINCT
        CASE
          WHEN sender_id = ? THEN receiver_id
          ELSE sender_id
        END AS other_user_id,
        MAX(created_at) AS last_message_at
       FROM messages
       WHERE sender_id = ? OR receiver_id = ?
       GROUP BY other_user_id
       ORDER BY last_message_at DESC`
    )
    .all(userId, userId, userId);
}
