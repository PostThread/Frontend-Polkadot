import { useEffect } from "react"
import { useState } from "react"
import { faker } from "@faker-js/faker";
import {
    EmojiHappyIcon,
} from "@heroicons/react/outline"
import { useQuery, useMutation } from '@apollo/client'
import { GET_COMMENTS_BY_POST_ID } from '../graphql/queries'
import TimeAgo from 'react-timeago'
import toast from "react-hot-toast"
import { ADD_COMMENT } from '../graphql/mutations'
import { useSession } from "next-auth/react";

function Comments({ id, showAddComment }) {

    const { data: session } = useSession()
    const [user_id, setUser_id] = useState(0)

    useEffect(() => {
        if (session?.user) {
            setUser_id(localStorage?.getItem("user_id"))
        }
    }, [session])

    const { data, refetch } = useQuery(GET_COMMENTS_BY_POST_ID, {
        variables: { id: id }
    })

    const [comment, setComment] = useState("")
    const comments = (data?.getCommentsUsingPost_id || [])
    console.log(data)
    console.log(comments)

    const [addComment] = useMutation(ADD_COMMENT, {
        refetchQueries: [
            GET_COMMENTS_BY_POST_ID,
            'getCommentUsingPost_id'
        ]
    })

    const sendComment = async (e) => {
        toast.loading("Posting your comment...", {
            id: "comment-toast",
        })
        e.preventDefault()
        const commentToSend = comment
        setComment("")

        try {
            await addComment({
                variables: {
                    body: commentToSend,
                    post_id: id,
                    user_id: user_id
                }
            })

            toast.success("Comment posted!", {
                id: "comment-toast",
            })

            refetch()
        } catch (error) {
            toast.error("Error posting comment", {
                id: "comment-toast",
            })
        }
    }

    return (
        <div className="bg-base-100 mt-7 p-5 border rounded-t-2xl rounded-b-2xl shadow-sm scrollbar-hide overflow-y-scroll">
            <div className="flex justify-between text-sm mb-5">
                <h3 className="text-sm font-bold text-gray-400">Comments</h3>
            </div>
            {comments.length > 0 && (
                <div className="ml-6 h-fit max-h-96 overflow-y-scroll scrollbar-hide scrollbar-thumb-black scrollbar-thin">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex items-center space-x-2 mb-3">
                            <img className="h-7 rounded-full" src={comment?.users?.profile_pic} />
                            <p className="text-sm flex-1">
                                <span className="font-bold">{comment?.users?.username}</span>
                                {" "}{comment.body}
                            </p>
                            <TimeAgo className="text-sm px-4" date={comment?.created_at} />
                        </div>
                    ))}
                </div>
            )}
            {showAddComment &&
                <form className="flex items-center p-4 border-t">
                    <EmojiHappyIcon className="h-7" />
                    <input
                        type="text"
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="border-none bg-base-100 flex-1 focus:ring-0 outline-none"
                    />
                    <button type="submit" onClick={sendComment} disabled={!comment.trim()} className="font-semibold text-primary hover:text-primary-focus cursor-pointer">Comment</button>
                </form>}
        </div>
    )
}

export default Comments