const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    subjectId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    goalId: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    subjectDescription: {
      type: String,
      trim: true,
    },

    instructor: {
      type: String,
      required: true,
      trim: true,
    },

    instructorId: {
      type: String,
      required: true,
      trim: true,
    },

    subtopics: {
      type: Array,
      required: true,
      default: [
        {
          subtopicName: {
            type: String,
            trim: true,
            required: true,
          },
          subtopicId: {
            type: String,
            trim: true,
            required: true,
          },
          chapters: {
            type: Array,
            default: [
              {
                chapterName: String,
                chapterId: String,
                chapterThumbnail: String,
                url: String,
              },
            ],
          },
        },
      ],
    },

    price: {
      type: String,
      trim: true,
    },

    free: {
      type: Boolean,
      trim: true,
    },

    duration: {
      type: String,
      trim: true,
    },

    subjectThumbnail: {
      type: String,
      trim: true,
      default:
        "https://raw.githubusercontent.com/educulture-edutech/icons/main/default-subject-image.png",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
