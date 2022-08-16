import Post from "./Post"
import { v4 as uuidv4 } from 'uuid';


function Posts({ posts }) {

    return (
        <div>
            {posts.map(post => (
                <Post key={uuidv4()} post={post} showAddComment={true} showComments={true} />
            ))}
        </div>
    )
}

export default Posts