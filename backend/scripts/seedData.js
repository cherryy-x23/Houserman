const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Account = require('../schemas/Account');
const Listing = require('../schemas/Listing');
const { Stay, Petition, Wishlist, ChatLine, Alert } = require('../schemas/extras');

const seed = async () => {
  await mongoose.connect(process.env.DB_CONNECTION);
  console.log('Linked to database for seeding...');

  await Promise.all([
    Account.deleteMany(),
    Listing.deleteMany(),
    Stay.deleteMany(),
    Petition.deleteMany(),
    Wishlist.deleteMany(),
    ChatLine.deleteMany(),
    Alert.deleteMany(),
  ]);
  console.log('Old data cleared.');

  const manager = await Account.create({
    fullName: 'Platform Manager',
    emailAddress: 'manager@houserman.com',
    passwordHash: 'Passcode123',
    accountType: 'manager',
    contactNumber: '9000000001',
  });

  const owner1 = await Account.create({
    fullName: 'Kiran Owner',
    emailAddress: 'owner1@houserman.com',
    passwordHash: 'Passcode123',
    accountType: 'owner',
    contactNumber: '9000000002',
  });

  const owner2 = await Account.create({
    fullName: 'Meena Owner',
    emailAddress: 'owner2@houserman.com',
    passwordHash: 'Passcode123',
    accountType: 'owner',
    contactNumber: '9000000003',
  });

  const seeker1 = await Account.create({
    fullName: 'Arjun Seeker',
    emailAddress: 'seeker1@houserman.com',
    passwordHash: 'Passcode123',
    accountType: 'seeker',
    contactNumber: '9000000004',
  });

  const seeker2 = await Account.create({
    fullName: 'Divya Seeker',
    emailAddress: 'seeker2@houserman.com',
    passwordHash: 'Passcode123',
    accountType: 'seeker',
    contactNumber: '9000000005',
  });

  console.log('Accounts created.');

  await Listing.insertMany([
    {
      ownerRef: owner1._id,
      heading: 'Cozy 2BHK Flat near Tech Park',
      summary: 'A well ventilated 2BHK flat close to major IT parks, perfect for working professionals. Includes modular kitchen and balcony.',
      category: 'Flat',
      monthlyCost: 18000,
      advanceAmount: 36000,
      bedroomCount: 2,
      bathroomCount: 2,
      floorArea: 950,
      furnishLevel: 'Fully Furnished',
      readyFrom: new Date(),
      locationInfo: { addressLine: 'Plot 12, Tech Park Road', area: 'Gachibowli', town: 'Hyderabad', region: 'Telangana', pin: '500032' },
      facilities: { internet: true, vehicleParking: true, generatorBackup: true, waterSupply24x7: true, airConditioned: true, guardSecurity: true },
      pictures: [{ fileName: 'demo1.jpg', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800' }],
      occupancyState: 'Open',
      moderationState: 'Cleared',
    },
    {
      ownerRef: owner1._id,
      heading: 'Spacious Independent House with Garden',
      summary: 'Independent house with a private garden, ideal for families. Quiet locality with good schools nearby.',
      category: 'Independent House',
      monthlyCost: 32000,
      advanceAmount: 64000,
      bedroomCount: 3,
      bathroomCount: 3,
      floorArea: 1800,
      furnishLevel: 'Partly Furnished',
      readyFrom: new Date(),
      locationInfo: { addressLine: '14-22 Lake View Street', area: 'Banjara Hills', town: 'Hyderabad', region: 'Telangana', pin: '500034' },
      facilities: { internet: true, vehicleParking: true, generatorBackup: false, waterSupply24x7: true, airConditioned: false, guardSecurity: true, fitnessCenter: false },
      pictures: [{ fileName: 'demo2.jpg', url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800' }],
      occupancyState: 'Open',
      moderationState: 'Cleared',
    },
    {
      ownerRef: owner2._id,
      heading: 'Premium Bungalow with Swimming Pool',
      summary: 'Luxury bungalow with a private swimming pool and fitness center access. Top tier amenities for premium living.',
      category: 'Bungalow',
      monthlyCost: 65000,
      advanceAmount: 130000,
      bedroomCount: 4,
      bathroomCount: 4,
      floorArea: 3200,
      furnishLevel: 'Fully Furnished',
      readyFrom: new Date(),
      locationInfo: { addressLine: '7 Palm Grove Avenue', area: 'Jubilee Hills', town: 'Hyderabad', region: 'Telangana', pin: '500033' },
      facilities: { internet: true, vehicleParking: true, generatorBackup: true, waterSupply24x7: true, airConditioned: true, guardSecurity: true, fitnessCenter: true, swimPool: true },
      pictures: [{ fileName: 'demo3.jpg', url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800' }],
      occupancyState: 'Open',
      moderationState: 'Cleared',
    },
    {
      ownerRef: owner2._id,
      heading: 'Single Room for Students near Campus',
      summary: 'Affordable single room ideal for students. Walking distance from university campus and local market.',
      category: 'Single Room',
      monthlyCost: 6500,
      advanceAmount: 13000,
      bedroomCount: 1,
      bathroomCount: 1,
      floorArea: 220,
      furnishLevel: 'Partly Furnished',
      readyFrom: new Date(),
      locationInfo: { addressLine: '5th Cross, Campus Road', area: 'Kukatpally', town: 'Hyderabad', region: 'Telangana', pin: '500072' },
      facilities: { internet: true, vehicleParking: false, generatorBackup: false, waterSupply24x7: true, airConditioned: false, guardSecurity: false },
      pictures: [{ fileName: 'demo4.jpg', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800' }],
      occupancyState: 'Open',
      moderationState: 'Cleared',
    },
    {
      ownerRef: owner1._id,
      heading: 'Modern 3BHK Flat with City View',
      summary: 'High rise apartment with stunning city views, modern interiors, and 24x7 security.',
      category: 'Flat',
      monthlyCost: 28000,
      advanceAmount: 56000,
      bedroomCount: 3,
      bathroomCount: 2,
      floorArea: 1400,
      furnishLevel: 'Fully Furnished',
      readyFrom: new Date(),
      locationInfo: { addressLine: 'Tower B, Skyline Residency', area: 'Madhapur', town: 'Hyderabad', region: 'Telangana', pin: '500081' },
      facilities: { internet: true, vehicleParking: true, generatorBackup: true, waterSupply24x7: true, airConditioned: true, guardSecurity: true, fitnessCenter: true },
      pictures: [{ fileName: 'demo5.jpg', url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800' }],
      occupancyState: 'Open',
      moderationState: 'Cleared',
    },
  ]);

  console.log('Listings created.');

  console.log('\nSeed data inserted successfully!\n');
  console.log('========================================');
  console.log('         TEST ACCOUNTS');
  console.log('========================================');
  console.log('MANAGER  -> manager@houserman.com');
  console.log('OWNER    -> owner1@houserman.com');
  console.log('OWNER    -> owner2@houserman.com');
  console.log('SEEKER   -> seeker1@houserman.com');
  console.log('SEEKER   -> seeker2@houserman.com');
  console.log('PASSCODE -> Passcode123 (same for all)');
  console.log('========================================\n');

  process.exit(0);
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
