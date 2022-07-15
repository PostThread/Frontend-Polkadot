import React, { useEffect, useState } from 'react'
import { useQuery } from "react-query";
import DisplayPosts from "../Feed/DisplayPosts";
import Loader from '../Loader';

export default function ProfileInfo({ type, user }) {

    const { error, isError, isLoading } = useQuery("announcements", fetchUserAnnouncements);
    const [announcements, setAnnouncements] = useState([]);
    const [msaId, setMsaId] = useState(0);
    const [iter, setIter] = useState(1);
    const numMessagesPerScroll = 10;

    console.log(JSON.stringify(user));

    useEffect(() => {
        fetchUserAnnouncements()
    }, [user])

    async function fetchUserAnnouncements() {
        let response
        if ((user.id || user.msa_id) > 0) {
            setAnnouncements([])
            if (type === "Posts") {
                response = await fetch(`/api/announcement/posts/${iter}/${numMessagesPerScroll}?` + new URLSearchParams({
                    sort_by: "new",
                    minutes_filter: 10000,
                    user_msa_id: user.id ?? user.msa_id
                }));
            } else {
                response = await fetch(`/api/announcement/comments/${iter}/${numMessagesPerScroll}?` + new URLSearchParams({
                    sort_by: "new",
                    minutes_filter: 10000,
                    user_msa_id: user.id ?? user.msa_id
                }));
            }
            const data = await response.json()
            setAnnouncements(announcements.concat(data));
            setIter(prevIter => prevIter + 1);
        }
    }



    return (
        <div className="w-2/5 md:w-2/5 max-h-screen  mx-4 bg-base-200 overflow-y-auto overflow-x-hidden">
            <div className="p-3 border-t-4 border-primary">
                <h1 className="text-inherit font-bold text-xl leading-8 my-1">{type}</h1>
                <div className="flex flex-col">
                    {isLoading ? (
                        <Loader text="Loading posts..." />
                    ) : (
                        (!announcements.length) ? `No ${type} found` : <DisplayPosts posts={announcements} />
                    )}
                </div>
            </div>
        </div>
    )
}
