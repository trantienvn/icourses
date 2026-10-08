import argon2 from 'argon2';
import { PrismaClient, Difficulty, QuestionStatus, QuestionType, RoleName, ClassroomTeacherRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const demoPassword = process.env.SEED_DEMO_PASSWORD;
  if (!adminEmail || !adminPassword || !demoPassword) {
    throw new Error('Set BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD, and SEED_DEMO_PASSWORD before seeding.');
  }
  if (adminPassword.length < 12 || demoPassword.length < 12) {
    throw new Error('Seed passwords must be at least 12 characters.');
  }

  const roleRecords = await Promise.all(Object.values(RoleName).map((name) =>
    prisma.role.upsert({ where: { name }, update: {}, create: { name } }),
  ));
  const roles = new Map(roleRecords.map((role) => [role.name, role]));
  const permissionKeys = [
    'user:manage', 'classroom:create', 'classroom:manage:own', 'question:manage:own',
    'exam:manage:own', 'exam:publish', 'attempt:read:self', 'result:read:self',
  ];
  const permissionRecords = await Promise.all(permissionKeys.map((key) =>
    prisma.permission.upsert({ where: { key }, update: {}, create: { key } }),
  ));
  const permissionsByRole: Record<RoleName, string[]> = {
    [RoleName.ADMIN]: permissionKeys,
    [RoleName.TEACHER]: ['classroom:create', 'classroom:manage:own', 'question:manage:own', 'exam:manage:own', 'exam:publish'],
    [RoleName.STUDENT]: ['attempt:read:self', 'result:read:self'],
  };
  for (const role of roleRecords) {
    for (const permission of permissionRecords.filter((item) => permissionsByRole[role.name]!.includes(item.key))) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {}, create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  await upsertUser({ username: 'admin', email: adminEmail, password: adminPassword, roleId: roles.get(RoleName.ADMIN)!.id });
  const teacherIds: string[] = [];
  for (let index = 1; index <= 2; index += 1) {
    const teacher = await upsertUser({
      username: `teacher${index}`, email: `teacher${index}@example.test`, password: demoPassword,
      roleId: roles.get(RoleName.TEACHER)!.id, fullName: `Giảng viên ${index}`,
    });
    teacherIds.push(teacher.id);
  }
  for (let index = 1; index <= 30; index += 1) {
    await upsertUser({
      username: `student${String(index).padStart(2, '0')}`,
      email: `student${String(index).padStart(2, '0')}@example.test`, password: demoPassword,
      roleId: roles.get(RoleName.STUDENT)!.id, studentCode: `SV${String(index).padStart(4, '0')}`,
      fullName: `Sinh viên ${index}`,
    });
  }

  const subject = await prisma.subject.upsert({
    where: { code: 'DEMO-CS' }, update: { name: 'Tin học cơ sở' },
    create: { code: 'DEMO-CS', name: 'Tin học cơ sở', description: 'Môn học mẫu' },
  });
  const topic = await prisma.topic.upsert({
    where: { subjectId_name: { subjectId: subject.id, name: 'Lập trình cơ bản' } },
    update: {}, create: { subjectId: subject.id, name: 'Lập trình cơ bản' },
  });
  const question = await prisma.question.upsert({
    where: { id: 'seed-question-001' }, update: {},
    create: {
      id: 'seed-question-001', creatorId: teacherIds[0]!, subjectId: subject.id, topicId: topic.id,
      type: QuestionType.SINGLE_CHOICE, difficulty: Difficulty.EASY, status: QuestionStatus.APPROVED,
      content: { text: 'Kiểu dữ liệu nào dùng để lưu giá trị đúng hoặc sai?' },
      options: { create: [
        { content: 'boolean', isCorrect: true, position: 0 },
        { content: 'string', isCorrect: false, position: 1 },
        { content: 'array', isCorrect: false, position: 2 },
        { content: 'object', isCorrect: false, position: 3 },
      ] },
    },
  });
  const classroom = await prisma.classroom.upsert({
    where: { code: 'DEMO-CLASS-01' }, update: {},
    create: {
      ownerId: teacherIds[0]!, subjectId: subject.id, code: 'DEMO-CLASS-01', joinCode: 'ABC234',
      name: 'Lớp Tin học cơ sở', academicYear: '2026-2027', semester: '1',
      teachers: { create: { teacherId: teacherIds[0]!, role: ClassroomTeacherRole.OWNER } },
    },
  });
  for (let index = 1; index <= 30; index += 1) {
    const student = await prisma.user.findUniqueOrThrow({ where: { username: `student${String(index).padStart(2, '0')}` } });
    await prisma.classroomMember.upsert({
      where: { classroomId_studentId: { classroomId: classroom.id, studentId: student.id } },
      update: {}, create: { classroomId: classroom.id, studentId: student.id },
    });
  }
  const exam = await prisma.exam.upsert({
    where: { id: 'seed-exam-001' }, update: {},
    create: {
      id: 'seed-exam-001', creatorId: teacherIds[0]!, subjectId: subject.id,
      name: 'Bài kiểm tra mẫu', durationSec: 1800,
      questions: { create: [{ position: 0, points: 10, snapshot: { questionId: question.id, type: question.type, content: question.content, options: [{ content: 'boolean', isCorrect: true }, { content: 'string', isCorrect: false }, { content: 'array', isCorrect: false }, { content: 'object', isCorrect: false }] } }] },
    },
  });
  console.info(`Sample exam created: ${exam.id}`);
  console.info('Seed complete: 1 admin, 2 teachers, 30 students, and sample class/question/exam.');
}

type UpsertUserInput = {
  username: string; email: string; password: string; roleId: string; fullName?: string; studentCode?: string;
};

async function upsertUser(input: UpsertUserInput) {
  const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
  const user = await prisma.user.upsert({
    where: { username: input.username },
    update: { email: input.email, passwordHash, status: 'ACTIVE' },
    create: { username: input.username, email: input.email, passwordHash, forcePasswordChange: input.username !== 'admin' },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: input.roleId } },
    update: {}, create: { userId: user.id, roleId: input.roleId },
  });
  if (input.studentCode && input.fullName) {
    await prisma.studentProfile.upsert({
      where: { userId: user.id }, update: { studentCode: input.studentCode, fullName: input.fullName },
      create: { userId: user.id, studentCode: input.studentCode, fullName: input.fullName },
    });
  } else if (input.fullName) {
    await prisma.teacherProfile.upsert({
      where: { userId: user.id }, update: { fullName: input.fullName }, create: { userId: user.id, fullName: input.fullName },
    });
  }
  return user;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());
