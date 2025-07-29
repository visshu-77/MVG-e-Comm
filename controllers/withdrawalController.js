const withdrawal = require("../models/withdrawalModel");
const Seller = require("../models/Seller");

// @desc    Request a withdrawal
// @route   POST /api/withdrawals
// @access  Private (Seller)
exports.requestWithdrawal = async (req, res) => {
  try {
    const sellerId = req.user._id;  
    const { amount, bankDetails } = req.body;

    if(!(amount && bankDetails)) {
      return res.status(400).json({ message: 'Amount and bank details are required' });
    }

    // Fetch seller and validate balance
    console.log("Request User:", req.user);
   const seller = await Seller.findOne({ user: req.user._id.toString() });
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    if (amount > seller.walletBalance) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Create withdrawal request
    const withdrawal = new Withdrawal({
      seller: sellerId,
      amount,
      bankDetails,
    });

    await withdrawal.save();

    // Deduct amount from wallet (will refund on rejection if needed)
    seller.walletBalance -= amount;
    await seller.save();

    res.status(201).json({
      message: 'Withdrawal request submitted',
      withdrawal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Withdrawal request failed', error });
  }
};

// @desc    Get all withdrawals (Admin)
// @route   GET /api/withdrawals
// @access  Private (Admin)
exports.getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await withdrawal.find()
      .populate('Seller', 'name email walletBalance')
      .sort({ createdAt: -1 });

    res.status(200).json(withdrawals);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to fetch withdrawals', error:error });
  }
};

// @desc    Get seller's own withdrawal history
// @route   GET /api/withdrawals/mine
// @access  Private (Seller)
exports.getMyWithdrawals = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const withdrawals = await Withdrawal.find({ seller: sellerId }).sort({ createdAt: -1 });

    res.status(200).json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your withdrawals', error });
  }
};

// @desc    Update withdrawal status (Admin)
// @route   PUT /api/withdrawals/:id/status
// @access  Private (Admin)
exports.updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    // If rejected, refund back to wallet
    if (status === 'rejected' && withdrawal.status !== 'rejected') {
      const seller = await Seller.findById(withdrawal.seller);
      if (seller) {
        seller.walletBalance += withdrawal.amount;
        await seller.save();
      }
    }

    withdrawal.status = status;
    await withdrawal.save();

    res.status(200).json({ message: `Withdrawal ${status}`, withdrawal });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update withdrawal status', error });
  }
};
