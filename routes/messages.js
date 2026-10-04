import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { sendMessageController, getConversationController, listConversationsController } from '../controllers/messageController.js';

const router = Router();

router.use(requireAuth);

router.post('/send', sendMessageController);
router.get('/:userId/conversations/:otherUserId', getConversationController);
router.get('/conversations', listConversationsController);

export default router;
