import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").unique().notNull(),
    password: text("password_hash").notNull(), // This is technically password_hash but commonly referred as password in loose typing
    role: text("role").default("user").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const profiles = pgTable("profiles", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }),
    fullName: text("full_name"),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    role: text("role").default("user").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const blogs = pgTable("blogs", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    authorId: uuid("author_id").references(() => users.id, { onDelete: 'set null' }),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
    id: uuid("id").defaultRandom().primaryKey(),
    blogId: uuid("blog_id").references(() => blogs.id, { onDelete: 'cascade' }),
    userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }),
    planName: text("plan_name").notNull(),
    status: text("status").default('active').notNull(),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    paymentId: text("payment_id"),
    amount: text("amount"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const certificates = pgTable("certificates", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }),
    limitId: text("limit_id"),
    issueDate: timestamp("issue_date").defaultNow(),
    certificateCode: text("certificate_code").unique(),
    downloadUrl: text("download_url"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    date: timestamp("date").notNull(),
    location: text("location"),
    images: text("images").array().default([]), // images is an array of text URLs
    price: text("price").default("0"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id").references(() => events.id, { onDelete: 'cascade' }),
    userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }),
    paymentStatus: text("payment_status").default('pending'),
    paymentId: text("payment_id"),
    amount: text("amount"),
    createdAt: timestamp("created_at").defaultNow(),
});


export const usersRelations = relations(users, ({ one, many }) => ({
    profile: one(profiles, {
        fields: [users.id],
        references: [profiles.userId],
    }),
    blogs: many(blogs),
    comments: many(comments),
}));

export const blogsRelations = relations(blogs, ({ one, many }) => ({
    author: one(users, {
        fields: [blogs.authorId],
        references: [users.id],
    }),
    comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
    blog: one(blogs, {
        fields: [comments.blogId],
        references: [blogs.id],
    }),
    user: one(users, {
        fields: [comments.userId],
        references: [users.id],
    }),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
    user: one(users, {
        fields: [certificates.userId],
        references: [users.id],
    }),
}));

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const selectUserSchema = createSelectSchema(users);
export type User = z.infer<typeof selectUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type GlobalUser = User;

export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, createdAt: true });
export const selectProfileSchema = createSelectSchema(profiles);
export type Profile = z.infer<typeof selectProfileSchema>;

export const insertBlogSchema = createInsertSchema(blogs).omit({ id: true, createdAt: true });
export const selectBlogSchema = createSelectSchema(blogs);
export type Blog = z.infer<typeof selectBlogSchema>;

export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export const selectCommentSchema = createSelectSchema(comments);
export type Comment = z.infer<typeof selectCommentSchema>;

export const insertCertificateSchema = createInsertSchema(certificates).omit({ id: true, createdAt: true });
export const selectCertificateSchema = createSelectSchema(certificates);
export type Certificate = z.infer<typeof selectCertificateSchema>;

export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export const selectEventSchema = createSelectSchema(events);
export type Event = z.infer<typeof selectEventSchema>;

export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export const selectBookingSchema = createSelectSchema(bookings);
export type Booking = z.infer<typeof selectBookingSchema>;


export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export type LoginData = z.infer<typeof loginSchema>;
export const registerSchema = loginSchema.extend({
    name: z.string().optional(),
    plan: z.string().optional(),
});
export type RegisterData = z.infer<typeof registerSchema>;
