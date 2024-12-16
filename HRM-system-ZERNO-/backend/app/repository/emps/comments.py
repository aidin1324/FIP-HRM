from sqlalchemy.future import select
from model import Comment
from repository.base import BaseRepository
from schema.emps.comments import CommentCreate, CommentUpdate


class CommentRepository(BaseRepository):

    async def get_all_comments(
            self
    ) -> list[Comment]:
        result = await self.connection.execute(select(Comment))
        comments = result.scalars().all()
        return list(comments)

    async def get_comment_by_id(
            self,
            comment_id: int
    ) -> Comment | None:
        result = await self.connection.execute(select(Comment).filter(Comment.id == comment_id))
        comment = result.scalars().first()
        return comment

    async def create_comment(
            self,
            comment_create: CommentCreate
    ) -> Comment:
        comment = Comment(**comment_create.model_dump())
        self.connection.add(comment)
        await self.connection.flush()
        await self.connection.refresh(comment)
        return comment

    async def update_comment(
            self,
            comment: Comment,
            comment_update: CommentUpdate
    ) -> Comment:
        update_fields = comment_update.dict(exclude_unset=True)
        for field, value in update_fields.items():
            setattr(comment, field, value)

        self.connection.add(comment)

        await self.connection.flush()
        await self.connection.refresh(comment)
        return comment

    async def delete_comment(
            self,
            comment: Comment
    ) -> dict:
        await self.connection.delete(comment)
        await self.connection.flush()
        return {"detail": "Comment deleted"}
