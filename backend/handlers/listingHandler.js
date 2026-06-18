const Listing = require('../schemas/Listing');
const { ServiceError } = require('../guards/errorGuard');
const { removeStoredFile } = require('../configs/fileStorage');

exports.fetchAllListings = async (req, res, next) => {
  try {
    const {
      town, area, category, lowCost, highCost,
      bedroomCount, furnishLevel, occupancyState,
      page = 1, count = 12, order = '-createdAt', ownerRef,
    } = req.query;

    const filter = {};
    if (town) filter['locationInfo.town'] = { $regex: town, $options: 'i' };
    if (area) filter['locationInfo.area'] = { $regex: area, $options: 'i' };
    if (category) filter.category = category;
    if (bedroomCount) filter.bedroomCount = Number(bedroomCount);
    if (furnishLevel) filter.furnishLevel = furnishLevel;
    if (occupancyState) filter.occupancyState = occupancyState;
    if (ownerRef) filter.ownerRef = ownerRef;
    else filter.moderationState = 'Cleared';
    if (lowCost || highCost) {
      filter.monthlyCost = {};
      if (lowCost) filter.monthlyCost.$gte = Number(lowCost);
      if (highCost) filter.monthlyCost.$lte = Number(highCost);
    }

    const skip = (Number(page) - 1) * Number(count);
    const total = await Listing.countDocuments(filter);
    const listings = await Listing.find(filter)
      .populate('ownerRef', 'fullName emailAddress contactNumber avatarImage')
      .sort(order)
      .skip(skip)
      .limit(Number(count));

    res.status(200).json({
      ok: true,
      total,
      pageCount: Math.ceil(total / Number(count)),
      activePage: Number(page),
      listings,
    });
  } catch (e) { next(e); }
};

exports.fetchOneListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('ownerRef', 'fullName emailAddress contactNumber avatarImage createdAt');
    if (!listing) return next(new ServiceError('Listing not found', 404));
    listing.hitCount += 1;
    await listing.save({ validateBeforeSave: false });
    res.status(200).json({ ok: true, listing });
  } catch (e) { next(e); }
};

exports.makeListing = async (req, res, next) => {
  try {
    req.body.ownerRef = req.account.id;
    if (req.files && req.files.length > 0) {
      req.body.pictures = req.files.map((f) => ({
        fileName: f.filename,
        url: f.path && f.path.startsWith('http') ? f.path : `http://localhost:${process.env.PORT}/assets_uploaded/${f.filename}`,
      }));
    }
    if (typeof req.body.facilities === 'string') req.body.facilities = JSON.parse(req.body.facilities);
    if (typeof req.body.locationInfo === 'string') req.body.locationInfo = JSON.parse(req.body.locationInfo);

    const listing = await Listing.create(req.body);
    res.status(201).json({ ok: true, listing });
  } catch (e) { next(e); }
};

exports.reviseListing = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);
    if (!listing) return next(new ServiceError('Listing not found', 404));
    if (listing.ownerRef.toString() !== req.account.id && req.account.accountType !== 'manager') {
      return next(new ServiceError('Not allowed to edit this listing', 403));
    }
    if (req.files && req.files.length > 0) {
      const fresh = req.files.map((f) => ({
        fileName: f.filename,
        url: f.path && f.path.startsWith('http') ? f.path : `http://localhost:${process.env.PORT}/assets_uploaded/${f.filename}`,
      }));
      req.body.pictures = [...(listing.pictures || []), ...fresh];
    }
    if (typeof req.body.facilities === 'string') req.body.facilities = JSON.parse(req.body.facilities);
    if (typeof req.body.locationInfo === 'string') req.body.locationInfo = JSON.parse(req.body.locationInfo);

    listing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ ok: true, listing });
  } catch (e) { next(e); }
};

exports.removeListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(new ServiceError('Listing not found', 404));
    if (listing.ownerRef.toString() !== req.account.id && req.account.accountType !== 'manager') {
      return next(new ServiceError('Not allowed to remove this listing', 403));
    }
    for (const pic of listing.pictures) removeStoredFile(pic.fileName);
    await listing.deleteOne();
    res.status(200).json({ ok: true, msg: 'Listing removed successfully' });
  } catch (e) { next(e); }
};

exports.removeListingPicture = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(new ServiceError('Listing not found', 404));
    if (listing.ownerRef.toString() !== req.account.id) return next(new ServiceError('Not allowed', 403));
    const pic = listing.pictures.find((p) => p._id.toString() === req.params.picId);
    if (!pic) return next(new ServiceError('Picture not found', 404));
    removeStoredFile(pic.fileName);
    listing.pictures = listing.pictures.filter((p) => p._id.toString() !== req.params.picId);
    await listing.save();
    res.status(200).json({ ok: true, listing });
  } catch (e) { next(e); }
};
