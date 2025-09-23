import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Chip
} from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';
import LaunchIcon from '@mui/icons-material/Launch';
import TimerIcon from '@mui/icons-material/Timer';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';

const GOOGLE_FORM_URL = 'https://forms.gle/YOUR_FORM_ID'; // TODO: 実際のGoogle Forms URLに変更

const FeedbackButton = () => {
  const [open, setOpen] = useState(false);
  const [hasClicked, setHasClicked] = useState(
    localStorage.getItem('feedbackClicked') === 'true'
  );

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFeedbackClick = () => {
    window.open(GOOGLE_FORM_URL, '_blank');
    localStorage.setItem('feedbackClicked', 'true');
    setHasClicked(true);
    setOpen(false);

    if (window.gtag) {
      window.gtag('event', 'feedback_form_opened', {
        event_category: 'engagement',
        event_label: 'google_form'
      });
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<FeedbackIcon />}
        onClick={handleOpen}
        sx={{
          animation: hasClicked ? 'none' : 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': { boxShadow: '0 0 0 0 rgba(79, 70, 229, 0.7)' },
            '70%': { boxShadow: '0 0 0 10px rgba(79, 70, 229, 0)' },
            '100%': { boxShadow: '0 0 0 0 rgba(79, 70, 229, 0)' }
          }
        }}
      >
        フィードバック
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div">
            🎯 FitStartをより良くするために
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              あなたの貴重なご意見をお聞かせください。
              アンケートにご協力いただくことで、より使いやすいアプリに改善していきます。
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<TimerIcon />}
              label="所要時間: 2-3分"
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<CardGiftcardIcon />}
              label="回答特典あり"
              color="success"
              variant="outlined"
            />
          </Box>

          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              📝 アンケート内容
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
              <li>使いやすさの評価</li>
              <li>お気に入りの機能</li>
              <li>改善してほしい点</li>
              <li>追加してほしい機能</li>
            </Typography>
          </Box>

          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
              🎁 回答特典
            </Typography>
            <Typography variant="body2" sx={{ color: 'success.dark' }}>
              有料版リリース時の1ヶ月無料クーポンをプレゼント！
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit">
            後で
          </Button>
          <Button
            onClick={handleFeedbackClick}
            variant="contained"
            endIcon={<LaunchIcon />}
            sx={{ minWidth: 120 }}
          >
            アンケートに回答
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FeedbackButton;