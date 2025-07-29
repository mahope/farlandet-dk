import { pool, testDatabaseConnection, isDatabaseInitialized } from '../config/database'
import bcrypt from 'bcrypt'

async function seedDatabase(verbose = true) {
  if (verbose) console.log('🌱 Seeding Farlandet database with initial data...')
  
  // Test connection and verify schema exists
  const connected = await testDatabaseConnection()
  if (!connected) {
    throw new Error('Could not establish database connection')
  }
  
  const initialized = await isDatabaseInitialized()
  if (!initialized) {
    console.log('⚠️  Database not initialized. Running initialization first...')
    const { initializeDatabase } = await import('./init-db')
    await initializeDatabase(false)
  }
  
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    if (verbose) console.log('📋 Inserting categories...')
    const categories = [
      { name: 'Forældreskab', description: 'Generelle tips og råd om at være far' },
      { name: 'Helbred & Fitness', description: 'Sundhed, træning og velvære for fædre' },
      { name: 'Karriere & Økonomi', description: 'Balance mellem arbejde og familie' },
      { name: 'Aktiviteter', description: 'Sjove aktiviteter at lave med børnene' },
      { name: 'Uddannelse', description: 'Læring og udvikling af børn' },
      { name: 'Teknologi', description: 'Digitale værktøjer og apps for familier' },
      { name: 'Mad & Madlavning', description: 'Opskrifter og madlavning med børn' },
      { name: 'Rejser', description: 'Familieferie og rejsetips' },
      { name: 'Psykologi', description: 'Mental sundhed og børnepsykologi' },
      { name: 'Fritidsinteresser', description: 'Hobbyer og interesser for fædre' }
    ]
    
    for (const category of categories) {
      await client.query(`
        INSERT INTO categories (name, description)
        VALUES ($1, $2)
        ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
      `, [category.name, category.description])
    }
    
    if (verbose) console.log('🏷️  Inserting common tags...')
    const commonTags = [
      'baby', 'søvn', 'aktiviteter', 'indendørs', 'outdoor', 'læring', 
      'mad', 'sundhed', 'træning', 'rejser', 'teknologi', 'apps',
      'podcast', 'bog', 'artikel', 'video', 'tips', 'guide',
      'småbørn', 'teenagere', 'sport', 'kreativitet', 'musik'
    ]
    
    for (const tag of commonTags) {
      await client.query(`
        INSERT INTO tags (name)
        VALUES ($1)
        ON CONFLICT (name) DO NOTHING
      `, [tag])
    }
    
    if (verbose) console.log('📝 Inserting sample resources...')
    const sampleResources = [
      {
        title: 'Danske Fædres Ultimate Guide til Babysøvn',
        description: 'Omfattende guide med praktiske tips og teknikker til at hjælpe din baby med at sove gennem natten. Baseret på danske forældres erfaringer og ekspertråd.',
        url: 'https://example.com/baby-sleep-guide',
        type: 'article',
        category: 'Forældreskab',
        status: 'approved',
        votes: 23,
        tags: ['baby', 'søvn', 'tips', 'guide']
      },
      {
        title: '15 Kreative Indendørs Aktiviteter for Regnvejrsdage',
        description: 'Sjove og udviklende aktiviteter du kan lave med børnene når vejret holder jer indendørs. Fra simple kreative projekter til lærerige spil.',
        url: 'https://example.com/indoor-activities',
        type: 'article',
        category: 'Aktiviteter',
        status: 'approved',
        votes: 18,
        tags: ['aktiviteter', 'indendørs', 'kreativitet', 'børn']
      },
      {
        title: 'Far & Søn Podcast - Building Stronger Bonds',
        description: 'Ugentlig dansk podcast der fokuserer på at styrke far-søn relationerne gennem aktiviteter, samtaler og fælles oplevelser.',
        url: 'https://example.com/podcast-far-son',
        type: 'podcast',
        category: 'Forældreskab',
        status: 'approved',
        votes: 31,
        tags: ['podcast', 'far-søn', 'relationer']
      },
      {
        title: 'Hjemmelavede Sunde Madpakker til Børn',
        description: 'Opskrifter og ideer til næringsrige madpakker som børnene faktisk vil spise. Inkluderer tips til meal prep og variation.',
        url: 'https://example.com/healthy-lunchboxes',
        type: 'article',
        category: 'Mad & Madlavning',
        status: 'approved',
        votes: 14,
        tags: ['mad', 'sundhed', 'børn', 'opskrifter']
      },
      {
        title: 'Fitness for Travle Fædre - 20 Minutters Træning',
        description: 'Effektive træningsprogrammer designet til fædre med begrænset tid. Kan udføres hjemme uden særligt udstyr.',
        url: 'https://example.com/dad-fitness',
        type: 'video',
        category: 'Helbred & Fitness',
        status: 'approved',
        votes: 27,
        tags: ['træning', 'fitness', 'sundhed', 'hjemmetræning']
      },
      {
        title: 'Økonomisk Planlægning for Nye Forældre',
        description: 'Praktisk guide til at håndtere familieøkonomien når der kommer børn til. Budgettering, opsparing og forsikringer.',
        url: 'https://example.com/family-finances',
        type: 'article',
        category: 'Karriere & Økonomi',
        status: 'approved',
        votes: 12,
        tags: ['økonomi', 'planlægning', 'budget', 'familie']
      },
      {
        title: 'De Bedste Apps til Familien 2024',
        description: 'Oversigt over nyttige apps til familielivet - fra kalender-apps til læringsværktøjer og underholdning for børn.',
        url: 'https://example.com/family-apps-2024',
        type: 'article',
        category: 'Teknologi',
        status: 'approved',
        votes: 19,
        tags: ['teknologi', 'apps', 'familie', 'digitale værktøjer']
      },
      {
        title: 'Konfliktløsning med Teenagere',
        description: 'Strategier til at navigere udfordringerne med teenagere og opbygge bedre kommunikation i familien.',
        url: 'https://example.com/teen-conflicts',
        type: 'article',
        category: 'Psykologi',
        status: 'pending',
        votes: 0,
        tags: ['teenagere', 'kommunikation', 'konflikter']
      }
    ]
    
    for (const resource of sampleResources) {
      // Get category ID
      const categoryResult = await client.query(
        'SELECT id FROM categories WHERE name = $1', 
        [resource.category]
      )
      
      if (categoryResult.rows.length > 0) {
        // Insert resource
        const resourceResult = await client.query(`
          INSERT INTO resources (title, description, url, type, category_id, status, votes, approved_at, submitted_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (title) DO UPDATE SET 
            description = EXCLUDED.description,
            url = EXCLUDED.url,
            votes = EXCLUDED.votes
          RETURNING id
        `, [
          resource.title,
          resource.description,
          resource.url,
          resource.type,
          categoryResult.rows[0].id,
          resource.status,
          resource.votes,
          resource.status === 'approved' ? new Date() : null,
          'System Seed'
        ])
        
        const resourceId = resourceResult.rows[0].id
        
        // Add tags to resource
        if (resource.tags && resource.tags.length > 0) {
          for (const tagName of resource.tags) {
            // Get tag ID
            const tagResult = await client.query('SELECT id FROM tags WHERE name = $1', [tagName])
            if (tagResult.rows.length > 0) {
              await client.query(`
                INSERT INTO resource_tags (resource_id, tag_id)
                VALUES ($1, $2)
                ON CONFLICT (resource_id, tag_id) DO NOTHING
              `, [resourceId, tagResult.rows[0].id])
            }
          }
        }
      }
    }
    
    if (verbose) console.log('👤 Creating default admin user...')
    // Create default admin user (password: admin123)
    const adminEmail = 'admin@farlandet.dk'
    const adminPassword = 'admin123'
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    
    await client.query(`
      INSERT INTO admin_users (email, password_hash, name)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        name = EXCLUDED.name
    `, [adminEmail, hashedPassword, 'System Administrator'])
    
    await client.query('COMMIT')
    
    if (verbose) {
      // Get final counts
      const countsResult = await client.query(`
        SELECT 
          (SELECT COUNT(*) FROM categories) as categories,
          (SELECT COUNT(*) FROM resources) as resources,
          (SELECT COUNT(*) FROM resources WHERE status = 'approved') as approved_resources,
          (SELECT COUNT(*) FROM tags) as tags,
          (SELECT COUNT(*) FROM admin_users) as admin_users
      `)
      
      const counts = countsResult.rows[0]
      
      console.log('✅ Database seeded successfully!')
      console.log('\n📊 Data Summary:')
      console.log(`   - ${counts.categories} categories created`)
      console.log(`   - ${counts.resources} total resources (${counts.approved_resources} approved)`)
      console.log(`   - ${counts.tags} tags available`)
      console.log(`   - ${counts.admin_users} admin user(s) created`)
      console.log('\n🔐 Default Admin Login:')
      console.log(`   Email: ${adminEmail}`)
      console.log(`   Password: ${adminPassword}`)
      console.log('\n⚠️  Remember to change the admin password in production!')
      console.log('\n🚀 Ready to start the server: npm run dev')
    }
    
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    client.release()
  }
}

// Check if database already has data
async function isDatabaseSeeded(): Promise<boolean> {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT COUNT(*) as count FROM categories')
    client.release()
    
    return parseInt(result.rows[0].count) > 0
  } catch (error) {
    return false
  }
}

if (require.main === module) {
  seedDatabase()
    .then(async () => {
      const seeded = await isDatabaseSeeded()
      if (seeded) {
        console.log('\n🎉 Database seeding complete!')
        process.exit(0)
      } else {
        console.error('\n❌ Database seeding verification failed')
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error('\n❌ Database seeding failed:', error.message)
      process.exit(1)
    })
}

export { seedDatabase, isDatabaseSeeded }