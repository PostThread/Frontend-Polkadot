import Posts from "./Posts"
import MiniProfile from "./MiniProfile"
import Suggestions from "./Suggestions"
import Trending from "./Trending"
import PostBox from "./PostBox"
import { useQuery } from "@apollo/client"
import { GET_USER_BY_USERNAME, GET_LATEST_POSTS } from "../graphql/queries"
import { useSession } from 'next-auth/react'
import { useEffect, useRef } from "react"
import { ADD_USER } from "../graphql/mutations";
import client from "../apollo-client"
import { JellyTriangle, Ring } from "@uiball/loaders"
import InfiniteScroll from 'react-infinite-scroller';
import ScrollToTop from "react-scroll-to-top";


function Feed() {

    const { data, fetchMore, previousData } = useQuery(GET_LATEST_POSTS, {
        variables: {
            limit: 10,
            offset: 0
        }
    })

    console.log(data?.getLatestPosts.length)
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

            if (!userExists) {
                const { data: { insertUsers: newUser } } = await client.mutate({
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

    if (!data?.getLatestPosts.length > 0) {
        return (
            <div className="flex w-full h-screen items-center justify-center p-10 text-3-xl">
                <JellyTriangle
                    size={50}
                    speed={1.4}
                    color="black"
                />
            </div>
        )
    } else {
        return (
            <main className="grid grid-cols-1 max-w-sm md:max-w-2xl lg:grid-cols-3 lg:max-w-5xl 
            xl:max-w-6xl mx-auto scrollbar-hide">
                <section className="col-span-2 h-screen scrollbar-hide overflow-auto">
                    <InfiniteScroll
                        pageStart={0}
                        loadMore={() => {
                            fetchMore({
                                variables: {
                                    limit: 10,
                                    offset: data?.getLatestPosts.length
                                },
                                updateQuery: (prev, { fetchMoreResult }) => {
                                    if (!fetchMoreResult) return prev
                                    return Object.assign({}, prev, {
                                        getLatestPosts: [...prev.getLatestPosts, ...fetchMoreResult.getLatestPosts]
                                    })
                                }
                            })
                        }}
                        hasMore={data?.getLatestPosts.length > previousData?.getLatestPosts.length}
                        useWindow={false}>
                        {session && <PostBox />}
                        {<Posts posts={data?.getLatestPosts} />}
                        <ScrollToTop />
                    </InfiniteScroll>

                </section>
                <section className="hidden lg:inline-grid md:col-span-1 ">
                    <div>
                        {session &&
                            <>
                                <MiniProfile image={session.user.image} name={session.user.name} />
                                <Suggestions />
                            </>}
                        {/* <Trending /> */}
                    </div>
                </section>

            </main>
        )
    }


}

export default Feed