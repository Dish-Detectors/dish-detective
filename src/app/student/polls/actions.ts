"use server";

import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/utils/dbConnect";
import Poll from "@/models/Poll";
import Restaurant from "@/models/Restaurant";
import PollAnswer from "@/models/PollAnswer";
import NotificationModel from "@/models/Notification";
import mongoose from "mongoose";

export async function getPoll(pollId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { errorKey: "unauthorized" };

    await dbConnect();

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(pollId)) {
      return { errorKey: "invalidPollId" };
    }

    const poll = await Poll.findById(pollId).lean();
    if (!poll) {
      return { errorKey: "pollNotFound" };
    }

    const restaurant = await Restaurant.findById(poll.restaurantId)
      .select("name")
      .lean();

    // Check if user already answered?
    const existingAnswer = await PollAnswer.findOne({
      pollId: pollId,
      userId: userId,
    });

    if (existingAnswer) {
      return { errorKey: "pollAlreadyAnswered", alreadyAnswered: true };
    }

    return {
      poll: JSON.parse(JSON.stringify(poll)),
      restaurantName: restaurant?.name || "__unknownRestaurant__",
    };
  } catch (error) {
    console.error("Error fetching poll:", error);
    return { errorKey: "pollFetchFailed" };
  }
}

export async function submitPollAnswers(
  pollId: string,
  answers: { questionIndex: number; value: number }[],
) {
  try {
    const { userId } = await auth();
    if (!userId) return { errorKey: "unauthorized" };

    await dbConnect();

    // Basic validation
    if (!answers || answers.length === 0) {
      return { errorKey: "pollNoAnswers" };
    }

    // Check for duplicates again
    const existingAnswer = await PollAnswer.findOne({
      pollId: pollId,
      userId: userId,
    });

    if (existingAnswer) {
      return { errorKey: "pollAlreadyAnswered" };
    }

    // Save answers
    // We need to map our frontend format to the model format if needed
    // Model expects: answers: [{ question: String, answer: Number }]
    // But wait, the model structure definition in `Step 216` was:
    /*
         answers: [{
            question: { type: String, required: true }, // The question text
            rating: { type: Number, required: true, min: 1, max: 5 }
         }]
        */
    // So I need to fetch the poll again to get the question text matching the index?
    // Or I should trust the client to send the text?
    // Better to fetch the poll to ensure data integrity.

    const poll = await Poll.findById(pollId);
    if (!poll) return { errorKey: "pollNotFound" };

    const formattedAnswers = answers.map((a) => {
      const questionText = poll.questions[a.questionIndex];
      return {
        question: questionText,
        rating: a.value,
      };
    });

    await PollAnswer.create({
      pollId,
      userId,
      answers: formattedAnswers,
    });

    // Automatically delete the notification for this poll
    try {
      // Find and delete the notification sent to this user for this poll
      const deleteResult = await NotificationModel.deleteOne({
        pollId: pollId,
        targetUserId: userId,
      });
      // We don't really care deeply if it fails or finds nothing, it's just cleanup
    } catch (notifError) {
      console.error("Error cleaning up poll notification:", notifError);
    }

    return { success: true };
  } catch (error) {
    console.error("Error submitting poll:", error);
    return { errorKey: "pollSubmitFailed" };
  }
}
