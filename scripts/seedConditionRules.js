require('dotenv').config();
const mongoose          = require('mongoose');
const ConditionRule    = require('../models/ConditionRule');
const rulesData = require('../config/conditionRules.json');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  for (const [cond, r] of Object.entries(rulesData)) {
    await ConditionRule.updateOne(
      { condition: cond },
      {
        condition: cond,
        nutrient:  r.nutrient,
        operator:  r.operator || '>',
        threshold: r.threshold
      },
      { upsert: true }
    );
  }
  console.log('✅ Seeded condition rules');
  process.exit(0);
}

seed().catch(err=>{
  console.error(err);
  process.exit(1);
});
