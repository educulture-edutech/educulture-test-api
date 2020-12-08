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

    subjectDescription: {
      type: String, 
      trim: true
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
            required: true
          },
          subtopicId: {
            type: String, 
            trim: true, 
            required: true
          },
          chapters: {
            type: Array,
            default: [
              {
                chapterName: String,
                chapterId: String, 
                url: String
              }
            ]
          }
        }
      ]
    },

    price: {
      type: Number,
      trim: true,
    },

    free: {
      type: Boolean, 
      trim: true
    }, 

    duration: {
      type: Number,
      trim: true
    },

    thumbnail: {
      type: String, 
      trim: true,
      default: "https://raw.githubusercontent.com/educulture-edutech/icons/main/default-subject-image.png"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);