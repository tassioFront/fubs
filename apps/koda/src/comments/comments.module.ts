import { Module } from "@nestjs/common";
import { PrismaService } from "src/common/prisma.service";
import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";
import { WorkspaceMemberService } from "src/auth/guards/workspace-member.service";

@Module({
  providers: [CommentsService, PrismaService, WorkspaceMemberService],
  exports: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}
