import { Answer } from './answers/answer.entity';
import { Question } from './questions/question.entity';
import { User } from './users/user.entity';

const DEFAULT_ADMIN = {
  email: 'admin@example.com',
  password: 'password',
};

const authenticate = async (email: string, password: string) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

export async function CreateAdmin(app: any) {
  const AdminJS = (await import('adminjs')).default;
  const AdminJSExpress = (await import('@adminjs/express')).default;
  const AdminJSTypeorm = await import('@adminjs/typeorm');
  AdminJS.registerAdapter({
    Resource: AdminJSTypeorm.Resource,
    Database: AdminJSTypeorm.Database,
  });

  const admin = new AdminJS({
    resources: [
      {
        resource: User,
      },
      {
        resource: Question,
      },
      {
        resource: Answer,
      },
    ],
  });

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
    authenticate,
    cookieName: 'adminjs',
    cookiePassword: 'sessionsecret',
  });
  app.use(admin.options.rootPath, adminRouter);
}
