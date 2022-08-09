import Posts from "./Posts"
import MiniProfile from "./MiniProfile"
import Suggestions from "./Suggestions"
import Trending from "./Trending"
import PostBox from "./PostBox"
import { useQuery } from "@apollo/client"
import { GET_ALL_POSTS, GET_USER_BY_USERNAME } from "../graphql/queries"
import { useSession } from 'next-auth/react'
import { useEffect } from "react"
import { useAppContext } from "../context/AppContext"
import { ADD_USER } from "../graphql/mutations";
import client from "../apollo-client"

function Feed() {

    const { data, error } = useQuery(GET_ALL_POSTS)
    const posts = data?.getPostList || []
    const { data: session } = useSession()

    useEffect(() => {
        const registerUser = async () => {
            const { data: { getUserByUsername } } = await client.query({
                query: GET_USER_BY_USERNAME,
                variables: {
                    username: session.user.username
                }
            })

            const userExists = getUserByUsername?.id > 0
            console.log("user " + getUserByUsername)

            if (!userExists) {
                const { data: { insertUser: newUser } } = await client.mutate({
                    mutation: ADD_USER,
                    variables: {
                        username: session.user.username,
                        profile_pic: session.user.image
                    }
                })

                localStorage.setItem("user_id", newUser.id)
            } else {
                localStorage.setItem("user_id", getUserByUsername.id)
            }
        }

        if (session) { registerUser() }
    }, [session])

    return (
        <main className={`grid grid-cols-1 max-w-sm md:max-w-2xl lg:grid-cols-3 lg:max-w-5xl 
        xl:max-w-6xl mx-auto`}>
            <section className="col-span-2">
                {session && <PostBox />}
                <Posts posts={posts} />
            </section>
            <section className="hidden lg:inline-grid md:col-span-1 ">
                <div className="mt-1">
                    {session &&
                        <>
                            <MiniProfile />
                            <Suggestions />
                        </>}
                    <Trending />
                </div>
            </section>
        </main>
    )
}

export default Feed