import User from "./infra/user";

class UserService {
  async updateUserAccess(id: string) {
    const userUpdated = await User.findByIdAndUpdate(
      id,
      { $set: { lastAccessAt: new Date(), updatedAt: new Date() } },
      { new: true, select: { password: 0 } },
    );
    return userUpdated;
  }

  async checkUserExists(email: string) {
    return User.findOne({ email });
  }
}

export default new UserService();
