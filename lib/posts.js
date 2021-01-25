import fs from "fs";
import path from "path";
import matter from "gray-matter";
import remark from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "posts"); //현재 작업 디렉토리(최상위) 뒤에 posts를 붙인다. -> /posts

export function getSortedPostsData() {
  // /posts 아래의 모든 파일 이름을 읽는다.
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // 파일 이름에서 .md를 지워서 id를 만들어내자.
    const id = fileName.replace(/\.md$/, "");

    // 마크다운파일의 경로를 구한다.
    const fullPath = path.join(postsDirectory, fileName);
    // 해당 마크다운 파일의 모든 내용을 읽는다.
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // gray-matter 활용해서 읽은 마크다운에서 메타데이터 읽는다.
    const matterResult = matter(fileContents);

    // id와 메타데이터를 추출해서 합친다.
    return {
      id,
      ...matterResult.data,
    };
  });
  // 날짜에 따라 정렬한다!
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);

  // Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       id: 'ssg-ssr'
  //     }
  //   },
  //   {
  //     params: {
  //       id: 'pre-rendering'
  //     }
  //   }
  // ]
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ""),
      },
    };
  });
}

//id에 대하여 PostData 하나 읽어오고, id랑 데이터 리턴
export async function getPostData(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);

  //위에서 HTML로 변환된 마크다운 언어를 문자열로 변환시켜준다.
  const contentHtml = processedContent.toString();

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...matterResult.data,
  };
}
