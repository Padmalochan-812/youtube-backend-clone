import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            type: String,
            require: true
        },
        thumbinl: {
            type: String,
            requre: true
        },
        title: {
            type: String,
            require: true
        },
        description:
        {
            type: String,
            reuqire: true
        },
        duration: {
            type: Number,
            default: 0
        },
        idPlulished: {
            type: Boolean,
            defaule: false
        },                                       
        woner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }

    },
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)