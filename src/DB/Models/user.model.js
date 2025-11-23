import mongoose from 'mongoose';
export const genderEnum = { male: 'male', female: 'female' };
export const roleEnum = { user: 'user', admin: 'admin' };
export const authSourceEnum = { system: 'system', google: 'google' };

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: function () {
        return this.provider === authSourceEnum.system;
      },
      trim: true,
    },
    lastName: {
      type: String,
      required: function () {
        return this.provider === authSourceEnum.system;
      },
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: function () {
        return this.provider === authSourceEnum.system;
      },
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    oldPasswords: [
      {
        type: String,
      },
    ],
    isForgotPasswordOtpConfirmed: {
      type: Boolean,
      default: false,
    },
    forgotPasswordOtp: {
      type: String,
    },
    forgotPasswordOtpExpiresAt: {
      type: Date,
    },
    age: {
      type: Number,
      min: [13, 'You must be at least 13 years old'],
      max: [120, 'Please provide a valid age'],
      required: function () {
        return this.provider === authSourceEnum.system;
      },
    },
    gender: {
      type: String,
      enum: Object.values(genderEnum),
      required: function () {
        return this.provider === authSourceEnum.system;
      },
    },
    phone: {
      type: String,
      trim: true,
      required: function () {
        return this.provider === authSourceEnum.system;
      },
    },
    role: {
      type: String,
      enum: Object.values(roleEnum),
      default: roleEnum.user,
    },
    photo: {
      secure_url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    coverImages: [
      {
        secure_url: {
          type: String,
        },
        public_id: {
          type: String,
        },
      },
    ],
    provider: {
      type: String,
      enum: Object.values(authSourceEnum),
      default: authSourceEnum.system,
    },
    confirmEmailOtp: {
      type: String,
    },
    confirmEmailOtpExpiresAt: {
      type: Date,
    },
    isEmailConfirmed: {
      type: Boolean,
      default: false,
    },
    emailConfirmedAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    restoredAt: {
      type: Date,
    },
    restoredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    changeCredentialsAt: {
      type: Date,
    },
  },
  {
    capped: { size: 10485760, max: 1 },
    virtuals: {
      fullName: {
        get: function () {
          return `${this.firstName} ${this.lastName}`;
        },
        set: function (name) {
          const [firstName, lastName] = name.split(' ');
          this.firstName = firstName;
          this.lastName = lastName;
        },
      },
    },
    methods: {
      userFullDocument: function () {
        return {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          age: this.age,
          gender: this.gender,
        };
      },
    },
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ firstName: 1, lastName: 1 }, { unique: true });

// User is Class (Function Constructor) that can make user objects (instances) from it
const User = mongoose.model.User || mongoose.model('User', userSchema);

export default User;
