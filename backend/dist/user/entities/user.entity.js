"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
let User = class User {
};
exports.User = User;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid', description: 'User ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'test@example.com', description: 'Email address' }),
    (0, typeorm_1.Column)({ unique: true, length: 255 }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'hashed_password', description: 'Password' }),
    (0, typeorm_1.Column)({ length: 255, select: false }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John', description: 'First name', nullable: true }),
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Doe', description: 'Last name', nullable: true }),
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: 'Is active' }),
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'reset_token',
        description: 'Reset password token',
        nullable: true,
    }),
    (0, typeorm_1.Column)({ nullable: true, type: 'varchar', length: 255 }),
    __metadata("design:type", Object)
], User.prototype, "resetPasswordToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-05-30T00:00:00.000Z',
        description: 'Reset password expires',
        nullable: true,
    }),
    (0, typeorm_1.Column)({ nullable: true, type: 'timestamp' }),
    __metadata("design:type", Object)
], User.prototype, "resetPasswordExpires", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'email_verification_token',
        description: 'Email verification token',
        nullable: true,
    }),
    (0, typeorm_1.Column)({ nullable: true, type: 'varchar', length: 255 }),
    __metadata("design:type", Object)
], User.prototype, "emailVerificationToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-05-30T00:00:00.000Z',
        description: 'Email verification expires',
        nullable: true,
    }),
    (0, typeorm_1.Column)({ nullable: true, type: 'timestamp' }),
    __metadata("design:type", Object)
], User.prototype, "emailVerificationExpires", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-05-29T12:00:00.000Z',
        description: 'Created at',
    }),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-05-29T12:00:00.000Z',
        description: 'Updated at',
    }),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'google_id',
        description: 'Google ID',
        nullable: true,
    }),
    (0, typeorm_1.Column)({ nullable: true, type: 'varchar', length: 255 }),
    __metadata("design:type", Object)
], User.prototype, "googleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/profile.jpg',
        description: 'Profile picture URL',
        nullable: true,
    }),
    (0, typeorm_1.Column)({ nullable: true, type: 'varchar', length: 255 }),
    __metadata("design:type", Object)
], User.prototype, "profilePicture", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map