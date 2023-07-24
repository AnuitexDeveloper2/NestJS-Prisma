import { ValidationPipe } from '@nestjs/common';
import { INestApplication } from '@nestjs/common/interfaces';
import * as pactum from 'pactum';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto } from 'src/bookmark/dto';
describe('App e2e', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        app = moduleRef.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
            }),
        );
        await app.init();
        await app.listen(3333);
        prisma = app.get(PrismaService);
        await prisma.cleanDb();
        pactum.request.setBaseUrl('http://localhost:3333');
    });
    afterAll(() => {
        app.close();
    });

    describe('Auth', () => {
        const dto: AuthDto = {
            email: 'test@gmail.com',
            password: '123',
        };
        describe('Signup', () => {
            it('should throw if email empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody({
                        password: dto.password,
                    })
                    .expectStatus(400);
            });
            it('should throw if password empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody({
                        email: dto.email,
                    })
                    .expectStatus(400);
            });
            it('should throw if no body provided', () => {
                return pactum.spec().post('/auth/signup').expectStatus(400);
            });
            it('should signup', () => {
                return pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201);
            });
        });

        describe('Signin', () => {
            it('should throw if email empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signin')
                    .withBody({
                        password: dto.password,
                    })
                    .expectStatus(400);
            });
            it('should throw if password empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signin')
                    .withBody({
                        email: dto.email,
                    })
                    .expectStatus(400);
            });
            it('should throw if no body provided', () => {
                return pactum.spec().post('/auth/signin').expectStatus(400);
            });
            it('should signin', () => {
                return pactum
                    .spec()
                    .post('/auth/signin')
                    .withBody(dto)
                    .expectStatus(200)
                    .stores('userAt', 'accessToken')
                    .inspect();
            });
        });
    });

    describe('User', () => {
        describe('Get me', () => {
            it('should get current user', () => {
                return pactum
                    .spec()
                    .get('/users/me')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .expectStatus(200)
                    .stores('id', '');
            });
        });
        describe('Edit user', () => {
            const dto: EditUserDto = {
                email: 'edited@gmail.com',
                firstName: 'test_test_test',
            };
            it('should edit user', () => {
                return pactum
                    .spec()
                    .patch('/users')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .withBody(dto)
                    .expectStatus(200)
                    .expectBodyContains(dto.firstName);
            });
        });
    });
    describe('Bookmarks', () => {
        describe('Get empty bookmarks', () => {
            it('should get bookmarks', () => {
                return pactum
                    .spec()
                    .get('/bookmarks')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .expectStatus(200).expectBody([]);
            });
        });
        describe('Create bookmark', () => {
          it('shoul create bookmark', ()=> {
            const dto: CreateBookmarkDto = {
              title: 'test title',
              link: 'www'
            }
            return pactum
                    .spec()
                    .post('/bookmarks')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .withBody(dto)
                    .expectStatus(201);
          })
        });
        describe('Get bookmark', () => {});
        describe('Get bookmark by id', () => {});
        describe('Bookmarks', () => {});
        describe('Bookmarks', () => {});
    });
});
