const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('no document found with that ID', 404));
    }

    res.status(204).json({ status: 'success', data: null });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    const modelName = Model.modelName.toLowerCase();

    if (!doc) {
      return next(new AppError(`no ${modelName} found with that ID`, 404));
    }

    const data = {};
    data[modelName] = doc;

    res.status(200).json({ status: 'success', data });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    const data = {};
    data[Model.modelName.toLowerCase()] = doc;
    res.status(201).json({
      status: 'success',
      data,
    });
  });
