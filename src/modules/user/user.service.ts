import { UserRepository } from './user.repository';
// Assuming token.helper and auth.password.service are properly typed
import { hashPassword, comparePassword } from '../../common/utils/token.helper';
import { BadRequestError } from '../../core/exceptions/BadRequestError';
import { NotFoundError } from '../../core/exceptions/NotFoundError';

// Placeholder for external dependency, would ideally be moved to a notification service
import { generateAndSendVerification } from '../auth/auth.password.service';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return await this.userRepository.update(userId, {
      profile_picture_url: avatarUrl,
    });
  }

  async updateProfile(
    userId: string,
    data: { name?: string; phone?: string; email?: string; birthDate?: Date }
  ) {
    const currentUser = await this.userRepository.findById(userId);
    if (!currentUser) throw new NotFoundError('User not found');

    if (data.email && data.email !== currentUser.email) {
      const existingEmail = await this.userRepository.findByEmail(data.email);
      if (existingEmail && existingEmail.id !== userId) {
        throw new BadRequestError('Email is already in use');
      }
    }

    const updateData: any = { ...data };

    if (data.email && data.email !== currentUser.email) {
      updateData.isVerified = false;
    }

    const updatedUser = await this.userRepository.update(userId, updateData);

    if (data.email && data.email !== currentUser.email) {
      // Background process: trigger email verification
      generateAndSendVerification({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      }).catch(console.error); // Do not await if not strictly needed or handle failure gracefully
    }

    return updatedUser;
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ) {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.password) {
      throw new BadRequestError('User not found or no password set');
    }

    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestError('Password lama is incorrect');
    }

    const hashedPassword = await hashPassword(newPassword);

    await this.userRepository.updatePassword(userId, hashedPassword);

    return { message: 'Password updated successfully' };
  }
}
