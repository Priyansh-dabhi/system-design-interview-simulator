import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import prisma from '../config/prisma.js';

export const get_learning_topics = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        
        const topics = await prisma.learningTopic.findMany({
            orderBy: { order: 'asc' },
            include: {
                lessons: {
                    select: { id: true }
                },
                progress: {
                    where: { userId }
                }
            }
        });

        // Format to easily consumable shape
        const formattedTopics = topics.map(topic => ({
            id: topic.id,
            title: topic.title,
            description: topic.description,
            slug: topic.slug,
            icon: topic.icon,
            totalLessons: topic.lessons.length,
            progress: topic.progress[0] || { completed: false, progress: 0 }
        }));

        res.json({ topics: formattedTopics });
    } catch (error) {
        console.error("Error fetching learning topics:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const get_topic_lessons = async (req: AuthRequest, res: Response) => {
    try {
        const slug = req.params.slug as string;
        const userId = req.user?.userId;

        const topic = await prisma.learningTopic.findUnique({
            where: { slug },
            include: {
                lessons: {
                    orderBy: { order: 'asc' },
                    include: {
                        attempts: {
                            where: { userId },
                            orderBy: { completedAt: 'desc' },
                            take: 1
                        }
                    }
                },
                progress: {
                    where: { userId }
                }
            }
        });

        if (!topic) {
            return res.status(404).json({ error: "Topic not found" });
        }

        res.json({ topic });
    } catch (error) {
        console.error("Error fetching topic lessons:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const get_lesson_detail = async (req: AuthRequest, res: Response) => {
    try {
        const lessonId = parseInt(req.params.id as string, 10);
        
        const lesson = await prisma.learningLesson.findUnique({
            where: { id: lessonId },
            include: {
                questions: {
                    orderBy: { order: 'asc' },
                    include: {
                        options: {
                            select: { id: true, text: true, isCorrect: true } // Expose isCorrect for MVP (client-side grading)
                        }
                    }
                }
            }
        });

        if (!lesson) {
            return res.status(404).json({ error: "Lesson not found" });
        }

        res.json({ lesson });
    } catch (error) {
        console.error("Error fetching lesson:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const complete_lesson_and_quiz = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const lessonId = parseInt(req.params.id as string, 10);
        const { score, totalQuestions, correctAnswers, topicId } = req.body;

        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        // Record quiz attempt
        const attempt = await prisma.learningQuizAttempt.create({
            data: {
                userId,
                lessonId,
                score,
                totalQuestions,
                correctAnswers
            }
        });

        // Update progress
        let progress = await prisma.learningProgress.findUnique({
            where: { userId_topicId: { userId, topicId } }
        });

        // Get total lessons to calculate real progress percentage
        const totalLessonsInTopic = await prisma.learningLesson.count({
            where: { topicId }
        });

        if (!progress) {
            const calculatedProgress = Math.min(100, Math.round((1 / totalLessonsInTopic) * 100));
            progress = await prisma.learningProgress.create({
                data: {
                    userId,
                    topicId,
                    lastLessonId: lessonId,
                    progress: calculatedProgress,
                    completed: calculatedProgress === 100
                }
            });
        } else {
            // Very simplified MVP progress logic
            const newProgress = Math.min(100, progress.progress + Math.round((1 / totalLessonsInTopic) * 100));
            progress = await prisma.learningProgress.update({
                where: { id: progress.id },
                data: {
                    lastLessonId: lessonId,
                    progress: newProgress,
                    completed: newProgress >= 95 // Close enough for MVP rounding
                }
            });
        }

        res.json({ success: true, attempt, progress });
    } catch (error) {
        console.error("Error completing lesson:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
