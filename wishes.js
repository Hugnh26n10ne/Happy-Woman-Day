/**
 * Wishes and Customization Engine for 20/10
 */

const WISH_PRESETS = {
  crush: {
    recipient: "em yêu",
    sender: "Anh của em",
    text: `Chúc em ngày 20/10 thật nhiều niềm vui, luôn rạng rỡ và xinh đẹp như những đóa hoa đang khoe sắc trong khu vườn này!

Người ta nói IT khô khan, chỉ biết code với màn hình đen trắng. Nhưng em chính là giao diện đẹp nhất mà anh từng thấy. Chúc em luôn hạnh phúc, bình yên bên anh mỗi ngày nhé! 💖`
  },
  friend: {
    recipient: "bạn",
    sender: "Team IT",
    text: `Chúc bạn ngày Phụ nữ Việt Nam 20/10 thật nhiều niềm vui, luôn xinh tươi, yêu đời và ngập tràn hạnh phúc!

Chúc bạn deadline nào cũng qua, bug nào cũng fix gọn, và luôn có thật nhiều đóa hoa tươi thắm trong cuộc sống! 🌷✨`
  },
  mom: {
    recipient: "Mẹ yêu",
    sender: "Con của Mẹ",
    text: `Nhân ngày 20/10, con chúc Mẹ luôn dồi dào sức khỏe, luôn vui tươi và an yên trong cuộc sống. Cảm ơn Mẹ vì tất cả những hy sinh và tình yêu thương vô bờ bến dành cho gia đình.

Mẹ mãi là bông hoa rực rỡ và đẹp nhất trong lòng con! 💐❤️`
  },
  cute: {
    recipient: "công chúa",
    sender: "Chàng trai IT",
    text: `POV: Anh là 1 chàng trai IT và nhất định không để em thiếu hoa ngày 20/10!

Anh có thể viết code giải quyết hàng vạn dòng lệnh phức tạp, nhưng trước nụ cười của em thì CPU của anh lúc nào cũng quá tải. Chúc em 20/10 ngập tràn kẹo ngọt và hạnh phúc! 🌸✨`
  }
};

class WishesManager {
  constructor() {
    this.nameSpan = document.getElementById('nameSpan');
    this.inputRecipient = document.getElementById('inputRecipient');
    this.inputSender = document.getElementById('inputSender');
    this.customWishText = document.getElementById('customWishText');
    this.editNameBtn = document.getElementById('editNameBtn');
    this.letterModal = document.getElementById('letterModal');
    this.openLetterBtn = document.getElementById('openLetterBtn');
    this.closeLetterBtn = document.getElementById('closeLetterBtn');
    this.saveWishBtn = document.getElementById('saveWishBtn');
    this.copyShareLinkBtn = document.getElementById('copyShareLinkBtn');
    this.shareBtn = document.getElementById('shareBtn');
    this.toast = document.getElementById('toast');

    // Flying Wish Card Elements
    this.flyingWishContainer = document.getElementById('flyingWishContainer');
    this.cardRecipientName = document.getElementById('cardRecipientName');
    this.cardWishBody = document.getElementById('cardWishBody');
    this.cardSenderName = document.getElementById('cardSenderName');
    this.minimizeCardBtn = document.getElementById('minimizeCardBtn');
    this.viewGardenBtn = document.getElementById('viewGardenBtn');
    this.editWishBtn = document.getElementById('editWishBtn');
    this.shareWishBtn = document.getElementById('shareWishBtn');
    this.reopenCardBtn = document.getElementById('reopenCardBtn');

    this.init();
  }

  init() {
    // 1. Read URL params
    const params = new URLSearchParams(window.location.search);
    const urlName = params.get('name');
    const urlMsg = params.get('msg');
    const urlFrom = params.get('from');

    if (urlName) {
      this.setRecipientName(urlName);
    } else {
      const savedName = localStorage.getItem('recipient_20_10');
      if (savedName) this.setRecipientName(savedName);
    }

    if (urlMsg) {
      this.customWishText.value = decodeURIComponent(urlMsg);
    } else {
      const savedWish = localStorage.getItem('wish_20_10');
      if (savedWish) this.customWishText.value = savedWish;
    }

    if (urlFrom) {
      this.inputSender.value = decodeURIComponent(urlFrom);
    } else {
      const savedFrom = localStorage.getItem('sender_20_10');
      if (savedFrom) this.inputSender.value = savedFrom;
    }

    this.updateCardContent();

    // 2. Setup Listeners
    this.setupEventListeners();
  }

  updateCardContent() {
    const recipient = this.inputRecipient.value.trim() || this.nameSpan.textContent || "bạn";
    const body = this.customWishText.value.trim();
    const sender = this.inputSender.value.trim() || "Chàng trai IT của em";

    if (this.cardRecipientName) this.cardRecipientName.textContent = recipient;
    if (this.cardWishBody) this.cardWishBody.textContent = body;
    if (this.cardSenderName) this.cardSenderName.textContent = sender;
  }

  showFlyingCard() {
    this.updateCardContent();
    if (this.flyingWishContainer) {
      this.flyingWishContainer.classList.add('active');
    }
    const bottomStory = document.querySelector('.bottom-story');
    if (bottomStory) bottomStory.style.opacity = '0';
    if (this.reopenCardBtn) {
      this.reopenCardBtn.classList.remove('visible');
    }
  }

  hideFlyingCard() {
    if (this.flyingWishContainer) {
      this.flyingWishContainer.classList.remove('active');
    }
    const bottomStory = document.querySelector('.bottom-story');
    if (bottomStory) bottomStory.style.opacity = '1';
    if (this.reopenCardBtn) {
      this.reopenCardBtn.classList.add('visible');
    }
  }

  setRecipientName(name) {
    if (!name || !name.trim()) name = "bạn";
    this.nameSpan.textContent = name;
    this.inputRecipient.value = name;
    if (this.cardRecipientName) this.cardRecipientName.textContent = name;
    localStorage.setItem('recipient_20_10', name);
  }

  showToast(message) {
    this.toast.textContent = message;
    this.toast.classList.add('show');
    setTimeout(() => {
      this.toast.classList.remove('show');
    }, 2800);
  }

  setupEventListeners() {
    // Edit name button
    this.editNameBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openLetterModal();
      this.inputRecipient.focus();
      this.inputRecipient.select();
    });

    // Click name span directly to open modal
    this.nameSpan.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openLetterModal();
      this.inputRecipient.focus();
      this.inputRecipient.select();
    });

    // Open/Close Letter Modal
    this.openLetterBtn.addEventListener('click', () => this.openLetterModal());
    this.closeLetterBtn.addEventListener('click', () => this.closeLetterModal());
    this.letterModal.addEventListener('click', (e) => {
      if (e.target === this.letterModal) this.closeLetterModal();
    });

    // Flying Card Buttons
    if (this.minimizeCardBtn) {
      this.minimizeCardBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hideFlyingCard();
        this.showToast('🌸 Bạn có thể nhấn "Bức thư 20/10" ở dưới để đọc lại bất kỳ lúc nào.');
      });
    }

    if (this.viewGardenBtn) {
      this.viewGardenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hideFlyingCard();
        this.showToast('🌸 Thưởng thức vườn hồng ngát hương! Bạn có thể chạm vào hoa để trồng thêm.');
      });
    }

    if (this.reopenCardBtn) {
      this.reopenCardBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showFlyingCard();
      });
    }

    if (this.editWishBtn) {
      this.editWishBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openLetterModal();
      });
    }

    if (this.shareWishBtn) {
      this.shareWishBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.copyShareableLink();
      });
    }

    // Preset buttons
    document.querySelectorAll('.preset-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const type = tag.getAttribute('data-type');
        if (WISH_PRESETS[type]) {
          const preset = WISH_PRESETS[type];
          this.inputRecipient.value = preset.recipient;
          this.inputSender.value = preset.sender;
          this.customWishText.value = preset.text;
          this.updateCardContent();
          this.showToast(`Đã áp dụng mẫu: ${tag.textContent}`);
        }
      });
    });

    // Save Wish Button
    this.saveWishBtn.addEventListener('click', () => {
      const name = this.inputRecipient.value.trim() || "bạn";
      this.setRecipientName(name);
      localStorage.setItem('wish_20_10', this.customWishText.value);
      localStorage.setItem('sender_20_10', this.inputSender.value);
      this.updateCardContent();
      this.closeLetterModal();
      this.showToast(`Đã cập nhật vườn hoa dành cho ${name}! 🌸`);

      // Trigger sparkle chime
      if (window.romanticAudio) {
        window.romanticAudio.playSparkle(1.2);
      }
    });

    // Copy Link Buttons
    this.copyShareLinkBtn.addEventListener('click', () => this.copyShareableLink());
    this.shareBtn.addEventListener('click', () => this.copyShareableLink());
  }

  openLetterModal() {
    this.letterModal.classList.add('active');
  }

  closeLetterModal() {
    this.letterModal.classList.remove('active');
  }

  copyShareableLink() {
    const name = encodeURIComponent(this.inputRecipient.value.trim() || this.nameSpan.textContent);
    const msg = encodeURIComponent(this.customWishText.value.trim());
    const from = encodeURIComponent(this.inputSender.value.trim());

    const url = new URL(window.location.href);
    url.searchParams.set('name', decodeURIComponent(name));
    url.searchParams.set('msg', decodeURIComponent(msg));
    url.searchParams.set('from', decodeURIComponent(from));

    const finalUrl = url.toString();

    navigator.clipboard.writeText(finalUrl).then(() => {
      this.showToast('✨ Đã sao chép liên kết! Hãy gửi cho cô ấy nhé 💌');
    }).catch(() => {
      prompt('Sao chép đường link gửi cho cô ấy:', finalUrl);
    });
  }
}

window.wishesManager = new WishesManager();
