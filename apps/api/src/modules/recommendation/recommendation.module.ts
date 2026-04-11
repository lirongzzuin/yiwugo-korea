import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { ActivityTrackerService } from './activity-tracker.service';
import { PreferenceComputerService } from './preference-computer.service';

@Module({
  controllers: [RecommendationController],
  providers: [
    RecommendationService,
    ActivityTrackerService,
    PreferenceComputerService,
  ],
  exports: [ActivityTrackerService, RecommendationService],
})
export class RecommendationModule {}
