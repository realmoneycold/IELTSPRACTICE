import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create sample centres
  const centres = await Promise.all([
    prisma.centre.upsert({
      where: { name: 'London IELTS Centre' },
      update: {},
      create: {
        name: 'London IELTS Centre',
        address: '123 Oxford Street',
        city: 'London',
        country: 'United Kingdom',
        phone: '+44 20 1234 5678',
        email: 'london@ieltspractice.com',
      },
    }),
    prisma.centre.upsert({
      where: { name: 'New York IELTS Centre' },
      update: {},
      create: {
        name: 'New York IELTS Centre',
        address: '456 Broadway',
        city: 'New York',
        country: 'United States',
        phone: '+1 212 555 0123',
        email: 'newyork@ieltspractice.com',
      },
    }),
    prisma.centre.upsert({
      where: { name: 'Sydney IELTS Centre' },
      update: {},
      create: {
        name: 'Sydney IELTS Centre',
        address: '789 George Street',
        city: 'Sydney',
        country: 'Australia',
        phone: '+61 2 9876 5432',
        email: 'sydney@ieltspractice.com',
      },
    }),
  ])

  console.log(`✅ Created ${centres.length} centres`)

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create CEO
  const ceo = await prisma.user.upsert({
    where: { email: 'ceo@ieltspractice.com' },
    update: {},
    create: {
      email: 'ceo@ieltspractice.com',
      name: 'John CEO',
      password: hashedPassword,
      role: 'CEO',
      isVerified: true,
      isOnboarded: true,
      currentBand: 9.0,
      targetBand: 9.0,
      tasksDone: 100,
    },
  })

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ieltspractice.com' },
    update: {},
    create: {
      email: 'admin@ieltspractice.com',
      name: 'Sarah Admin',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
      isOnboarded: true,
      currentBand: 8.5,
      targetBand: 9.0,
      tasksDone: 50,
    },
  })

  // Create Teachers
  const teachers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'teacher1@ieltspractice.com' },
      update: {},
      create: {
        email: 'teacher1@ieltspractice.com',
        name: 'Michael Teacher',
        password: hashedPassword,
        role: 'TEACHER',
        isVerified: true,
        isOnboarded: true,
        currentBand: 8.5,
        targetBand: 9.0,
        tasksDone: 25,
        country: 'United Kingdom',
        phone: '+44 20 1234 5679',
      },
    }),
    prisma.user.upsert({
      where: { email: 'teacher2@ieltspractice.com' },
      update: {},
      create: {
        email: 'teacher2@ieltspractice.com',
        name: 'Emma Teacher',
        password: hashedPassword,
        role: 'TEACHER',
        isVerified: true,
        isOnboarded: true,
        currentBand: 8.0,
        targetBand: 8.5,
        tasksDone: 30,
        country: 'United States',
        phone: '+1 212 555 0124',
      },
    }),
  ])

  // Create Students
  const students = await Promise.all([
    prisma.user.upsert({
      where: { email: 'student1@ieltspractice.com' },
      update: {},
      create: {
        email: 'student1@ieltspractice.com',
        name: 'Alex Student',
        password: hashedPassword,
        role: 'STUDENT',
        isVerified: true,
        isOnboarded: true,
        currentBand: 6.5,
        targetBand: 7.5,
        tasksDone: 12,
        country: 'United Kingdom',
        testType: 'ACADEMIC',
      },
    }),
    prisma.user.upsert({
      where: { email: 'student2@ieltspractice.com' },
      update: {},
      create: {
        email: 'student2@ieltspractice.com',
        name: 'Maria Student',
        password: hashedPassword,
        role: 'STUDENT',
        isVerified: true,
        isOnboarded: true,
        currentBand: 7.0,
        targetBand: 8.0,
        tasksDone: 18,
        country: 'Spain',
        testType: 'GENERAL',
      },
    }),
    prisma.user.upsert({
      where: { email: 'student3@ieltspractice.com' },
      update: {},
      create: {
        email: 'student3@ieltspractice.com',
        name: 'Li Student',
        password: hashedPassword,
        role: 'STUDENT',
        isVerified: true,
        isOnboarded: true,
        currentBand: 5.5,
        targetBand: 7.0,
        tasksDone: 8,
        country: 'China',
        testType: 'ACADEMIC',
      },
    }),
    prisma.user.upsert({
      where: { email: 'student4@ieltspractice.com' },
      update: {},
      create: {
        email: 'student4@ieltspractice.com',
        name: 'Ahmed Student',
        password: hashedPassword,
        role: 'STUDENT',
        isVerified: true,
        isOnboarded: true,
        currentBand: 6.0,
        targetBand: 6.5,
        tasksDone: 15,
        country: 'Egypt',
        testType: 'GENERAL',
      },
    }),
  ])

  console.log(`✅ Created 1 CEO, 1 Admin, ${teachers.length} Teachers, ${students.length} Students`)

  // Create sample test submissions
  const testTypes = ['READING', 'LISTENING', 'WRITING', 'SPEAKING']
  
  for (const student of students) {
    for (const testType of testTypes) {
      // Create 2-3 submissions per student per test type
      const numSubmissions = Math.floor(Math.random() * 2) + 2
      
      for (let i = 0; i < numSubmissions; i++) {
        const score = Math.random() * 40 + 10 // Score between 10-50
        const bandScore = (score / 50) * 9 // Convert to band score
        
        await prisma.testSubmission.create({
          data: {
            userId: student.id,
            testId: `${testType}_${i + 1}`,
            testType: testType as any,
            answers: {},
            score: score,
            bandScore: Math.round(bandScore * 2) / 2, // Round to nearest 0.5
            timeSpent: Math.floor(Math.random() * 1800) + 600, // 10-40 minutes
            submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Within last 30 days
            gradedAt: new Date(),
            feedback: {
              strengths: ['Good vocabulary', 'Clear structure'],
              improvements: ['Grammar accuracy', 'Time management'],
              overall: 'Keep practicing!'
            },
          },
        })
      }
    }
  }

  console.log('✅ Created sample test submissions')

  // Create user progress records
  for (const student of students) {
    for (const testType of testTypes) {
      await prisma.userProgress.upsert({
        where: {
          userId_testType: {
            userId: student.id,
            testType: testType as any,
          },
        },
        update: {},
        create: {
          userId: student.id,
          testType: testType as any,
          latestScore: Math.random() * 9,
          testsCompleted: Math.floor(Math.random() * 5) + 1,
          lastTestDate: new Date(),
        },
      })
    }
  }

  console.log('✅ Created user progress records')

  // Create sample announcements
  await Promise.all([
    prisma.announcement.create({
      data: {
        title: 'Welcome to IELTS Practice Platform',
        content: 'We are excited to have you join our comprehensive IELTS preparation platform. Start with a diagnostic test to assess your current level.',
        type: 'GENERAL',
        createdBy: ceo.id,
      },
    }),
    prisma.announcement.create({
      data: {
        title: 'System Maintenance This Weekend',
        content: 'The platform will undergo maintenance on Saturday from 2 AM to 4 AM EST. Please save your work before this time.',
        type: 'MAINTENANCE',
        createdBy: admin.id,
      },
    }),
    prisma.announcement.create({
      data: {
        title: 'New AI Features Released',
        content: 'Check out our new AI-powered study plans and tutor chat features to enhance your learning experience.',
        type: 'GENERAL',
        createdBy: admin.id,
      },
    }),
  ])

  console.log('✅ Created sample announcements')

  console.log('\n🎉 Database seeding completed successfully!')
  console.log('\n📋 Login Credentials:')
  console.log('CEO: ceo@ieltspractice.com / password123')
  console.log('Admin: admin@ieltspractice.com / password123')
  console.log('Teacher: teacher1@ieltspractice.com / password123')
  console.log('Student: student1@ieltspractice.com / password123')
  console.log('Student: student2@ieltspractice.com / password123')
  console.log('Student: student3@ieltspractice.com / password123')
  console.log('Student: student4@ieltspractice.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
