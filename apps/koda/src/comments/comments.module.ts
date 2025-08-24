import { Module } from "@nestjs/common";
import { PrismaService } from "src/common/prisma.service";
import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";

@Module({
  providers: [CommentsService, PrismaService],
  exports: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}
