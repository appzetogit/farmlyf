import TrustSignal from '../models/TrustSignal.js';

export const getTrustSignals = async (req, res) => {
  try {
    const signals = await TrustSignal.find({}).sort({ order: 1 });
    res.json(signals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTrustSignal = async (req, res) => {
  try {
    const signal = await TrustSignal.create(req.body);
    res.status(201).json(signal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTrustSignal = async (req, res) => {
  try {
    const signal = await TrustSignal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(signal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTrustSignal = async (req, res) => {
  try {
    await TrustSignal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trust signal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
