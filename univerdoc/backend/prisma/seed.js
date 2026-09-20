const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding UniverDoc database for Petroleum Training Institute (PTI)...');

  // Clear existing data
  await prisma.auditLog.deleteMany({});
  await prisma.issue.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.documentSubmission.deleteMany({});
  await prisma.documentType.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});

  const saltRounds = 12;
  const adminPasswordHash = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD || 'Admin@123', saltRounds);
  const staffPasswordHash = await bcrypt.hash('Staff@123', saltRounds);
  const studentPasswordHash = await bcrypt.hash('Alex@123', saltRounds);

  // 1. Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      name: 'PTI Clearance Administrator',
      email: 'superadmin@univerdoc.edu.ng',
      username: 'superadmin',
      password_hash: adminPasswordHash,
      role: 'superadmin',
      is_active: true,
      is_logged_in: false,
    },
  });
  console.log('Created Super Admin:', superAdmin.username);

  // 2. Departments
  const departmentsData = [
    {
      slug: 'finance',
      name: 'Finance',
      icon: '💳',
      color: '#f59e0b',
      docTypes: [
        { slug: 'fee_payment_receipt', label: 'Fee Payment Receipt', icon: '🧾' },
        { slug: 'scholarship_certificate', label: 'Scholarship Certificate', icon: '📜' },
        { slug: 'bank_statement', label: 'Bank Statement', icon: '🏦' },
      ],
    },
    {
      slug: 'library',
      name: 'Library',
      icon: '📚',
      color: '#8b5cf6',
      docTypes: [
        { slug: 'library_card_copy', label: 'Library Card Copy', icon: '🪪' },
        { slug: 'library_clearance_form', label: 'Library Clearance Form', icon: '📋' },
      ],
    },
    {
      slug: 'admin',
      name: 'Administration',
      icon: '🏛️',
      color: '#06b6d4',
      docTypes: [
        { slug: 'admission_letter', label: 'Admission Letter', icon: '✉️' },
        { slug: 'enrollment_form', label: 'Enrollment Form', icon: '📑' },
        { slug: 'clearance_letter', label: 'Clearance Letter', icon: '📄' },
      ],
    },
    {
      slug: 'academic',
      name: 'Academic Records',
      icon: '🎓',
      color: '#10b981',
      docTypes: [
        { slug: 'official_transcript', label: 'Official Transcript', icon: '🎓' },
        { slug: 'government_id_proof', label: 'Government ID Proof', icon: '🆔' },
        { slug: 'result_slip', label: 'Result Slip', icon: '📊' },
      ],
    },
  ];

  const createdDepts = {};
  const createdDocTypes = {};
  const createdStaff = {};

  for (const dept of departmentsData) {
    const createdDept = await prisma.department.create({
      data: {
        slug: dept.slug,
        name: dept.name,
        icon: dept.icon,
        color: dept.color,
      },
    });
    createdDepts[dept.slug] = createdDept;

    // Document types for department
    for (const dt of dept.docTypes) {
      const createdDt = await prisma.documentType.create({
        data: {
          department_id: createdDept.id,
          slug: dt.slug,
          label: dt.label,
          icon: dt.icon,
          is_required: true,
        },
      });
      createdDocTypes[dt.slug] = createdDt;
    }

    // 2 Credential slots per department: slot 1 active, slot 2 inactive
    for (let slot = 1; slot <= 2; slot++) {
      const username = `${dept.slug}_0${slot}`;
      const isActive = slot === 1;
      const staffUser = await prisma.user.create({
        data: {
          name: `${dept.name} Officer 0${slot}`,
          email: `${dept.slug}0${slot}@univerdoc.edu.ng`,
          username: username,
          password_hash: staffPasswordHash,
          role: 'dept_staff',
          department_id: createdDept.id,
          slot_number: slot,
          is_active: isActive,
          is_logged_in: false,
        },
      });
      createdStaff[username] = staffUser;
    }
  }
  console.log('Created Departments, Document Types, and Staff Slots.');

  // 3. Demo Student: Alex Mercer
  const demoStudent = await prisma.user.create({
    data: {
      name: 'Alex Mercer',
      email: 'alex@university.edu',
      matric_no: 'M.24/ND/PEG/11245',
      username: 'alex.mercer',
      password_hash: studentPasswordHash,
      role: 'student',
      is_active: true,
      is_logged_in: false,
    },
  });
  console.log('Created Demo Student:', demoStudent.name, demoStudent.matric_no);

  // 4. Pre-populated Document Submissions
  const now = new Date();
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);

  // Fee Receipt: Approved
  await prisma.documentSubmission.create({
    data: {
      student_id: demoStudent.id,
      document_type_id: createdDocTypes['fee_payment_receipt'].id,
      status: 'approved',
      file_name: 'Alex_Mercer_Fee_Receipt_2026.pdf',
      file_url: '/uploads/sample_fee_receipt.pdf',
      uploaded_at: threeDaysAgo,
      reviewed_at: twoDaysAgo,
      reviewed_by: createdStaff['finance_01'].id,
      version: 1,
    },
  });

  // Admission Letter: Pending
  await prisma.documentSubmission.create({
    data: {
      student_id: demoStudent.id,
      document_type_id: createdDocTypes['admission_letter'].id,
      status: 'pending',
      file_name: 'Alex_Mercer_PTI_Admission_Letter.pdf',
      file_url: '/uploads/sample_admission_letter.pdf',
      uploaded_at: oneDayAgo,
      version: 1,
    },
  });

  // Library Card Copy: Rejected
  await prisma.documentSubmission.create({
    data: {
      student_id: demoStudent.id,
      document_type_id: createdDocTypes['library_card_copy'].id,
      status: 'rejected',
      file_name: 'Alex_Mercer_Library_Card.png',
      file_url: '/uploads/sample_library_card.png',
      uploaded_at: twoDaysAgo,
      reviewed_at: oneDayAgo,
      reviewed_by: createdStaff['library_01'].id,
      rejection_note: 'Document image is blurry and expiration date is not legible. Please re-upload a clear scan.',
      version: 1,
    },
  });

  // Official Transcript: Pending
  await prisma.documentSubmission.create({
    data: {
      student_id: demoStudent.id,
      document_type_id: createdDocTypes['official_transcript'].id,
      status: 'pending',
      file_name: 'Alex_Mercer_ND_Transcript.pdf',
      file_url: '/uploads/sample_transcript.pdf',
      uploaded_at: now,
      version: 1,
    },
  });

  // The rest are not submitted yet
  for (const key of Object.keys(createdDocTypes)) {
    if (!['fee_payment_receipt', 'admission_letter', 'library_card_copy', 'official_transcript'].includes(key)) {
      await prisma.documentSubmission.create({
        data: {
          student_id: demoStudent.id,
          document_type_id: createdDocTypes[key].id,
          status: 'not_submitted',
          version: 1,
        },
      });
    }
  }

  // 5. Initial Notifications for Student
  await prisma.notification.createMany({
    data: [
      {
        user_id: demoStudent.id,
        subject: 'UniverDoc: Fee Payment Receipt Approved ✓',
        body: 'Your Fee Payment Receipt has been officially reviewed and approved by the Finance Department.',
        type: 'approval',
        is_read: true,
        sent_at: twoDaysAgo,
      },
      {
        user_id: demoStudent.id,
        subject: 'UniverDoc: Action Required — Library Card Copy Rejected',
        body: 'Your Library Card Copy was rejected by the Library Department. Reason: Document image is blurry and expiration date is not legible. Please re-upload a clear scan.',
        type: 'rejection',
        is_read: false,
        sent_at: oneDayAgo,
      },
      {
        user_id: demoStudent.id,
        subject: 'Welcome to UniverDoc, Alex Mercer',
        body: 'Your student clearance account for Petroleum Training Institute (Matric: M.24/ND/PEG/11245) is ready. Please upload all required clearance documents.',
        type: 'system',
        is_read: false,
        sent_at: threeDaysAgo,
      },
    ],
  });

  // 6. Demo Flagged Issue
  await prisma.issue.create({
    data: {
      reported_by: demoStudent.id,
      reporter_role: 'student',
      department_id: createdDepts['library'].id,
      subject: 'Inquiry regarding library clearance counter signature',
      body: 'Good day, my library clearance card from the temporary library annex was returned because the signature format changed this semester. Kindly advise on the updated stamp required.',
      status: 'open',
      created_at: oneDayAgo,
    },
  });

  // 7. Initial Audit Log
  await prisma.auditLog.create({
    data: {
      actor_id: superAdmin.id,
      action: 'system.initialized',
      target_type: 'system',
      metadata: JSON.stringify({ note: 'Initial UniverDoc system seed completed for PTI Effurun' }),
      created_at: threeDaysAgo,
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });