import 'dotenv/config';

async function main() {
  // Seed data will be added when domain models are defined.
  console.log('No seed data configured yet.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
