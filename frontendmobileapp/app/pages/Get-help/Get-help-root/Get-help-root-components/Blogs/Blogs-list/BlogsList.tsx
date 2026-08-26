import { View } from "react-native";
import OneBlog from "../One-blog/OneBlog";
import styles from "./BlogsListStyles";
import { useAppSelector } from "@/app/store/hooks";
import ListStateView from "@/app/Universal-components/List-state/ListStateView";
import { useSettleAfter } from "@/app/Universal-components/List-state/useSettleAfter";

const BlogsList = () => {
  const blogs = useAppSelector((state) => state.getHelp.blogs);
  const searchQuery = useAppSelector((state) => state.getHelp.currentSearchQuery);
  const settled = useSettleAfter();

  return (
    <View>
      <View style={styles.blogsContainer}>
        {blogs.map((blog, index) => (
          <OneBlog blog={blog} key={index} />
        ))}
      </View>
      {blogs.length === 0 && (
        <ListStateView
          loading={!settled}
          loadingText="Loading blogs..."
          emptyText={
            searchQuery ? `No blogs found for "${searchQuery}".` : "No blogs available yet."
          }
        />
      )}
    </View>
  );
};

export default BlogsList;
