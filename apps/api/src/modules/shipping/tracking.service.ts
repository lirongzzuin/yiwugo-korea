import { Injectable, Logger, NotFoundException } from '@nestjs/common';

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

export interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  origin: string;
  destination: string;
  currentStatus: string;
  estimatedDelivery: string | null;
  events: TrackingEvent[];
}

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  /**
   * Get tracking info for a tracking number
   * Currently returns mock data — would integrate with 17TRACK or AfterShip
   */
  async getTrackingInfo(trackingNumber: string): Promise<TrackingInfo> {
    if (!trackingNumber || trackingNumber.trim().length === 0) {
      throw new NotFoundException('운송장 번호를 입력해주세요.');
    }

    // TODO: Integrate with 17TRACK API or AfterShip API
    // For now, return mock tracking data
    const now = new Date();

    const mockEvents: TrackingEvent[] = [
      {
        timestamp: new Date(
          now.getTime() - 5 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: 'PICKED_UP',
        location: '중국 이우시 (义乌市)',
        description: '상품이 수거되었습니다.',
      },
      {
        timestamp: new Date(
          now.getTime() - 4 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: 'IN_TRANSIT',
        location: '중국 항저우 물류센터',
        description: '국제 물류센터에 도착하였습니다.',
      },
      {
        timestamp: new Date(
          now.getTime() - 3 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: 'DEPARTED',
        location: '중국 상하이 푸동국제공항',
        description: '항공편 출발하였습니다.',
      },
      {
        timestamp: new Date(
          now.getTime() - 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: 'ARRIVED',
        location: '대한민국 인천국제공항',
        description: '목적지 국가에 도착하였습니다.',
      },
      {
        timestamp: new Date(
          now.getTime() - 1 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: 'IN_CUSTOMS',
        location: '인천세관',
        description: '통관 진행 중입니다.',
      },
      {
        timestamp: new Date(
          now.getTime() - 12 * 60 * 60 * 1000,
        ).toISOString(),
        status: 'CUSTOMS_CLEARED',
        location: '인천세관',
        description: '통관이 완료되었습니다.',
      },
      {
        timestamp: new Date(
          now.getTime() - 6 * 60 * 60 * 1000,
        ).toISOString(),
        status: 'DOMESTIC_SHIPPING',
        location: '서울 강남 물류센터',
        description: '국내 배송이 시작되었습니다. (CJ대한통운)',
      },
    ];

    const estimatedDelivery = new Date(
      now.getTime() + 1 * 24 * 60 * 60 * 1000,
    );

    return {
      trackingNumber,
      carrier: 'YiwuGo Express',
      origin: '중국 이우시',
      destination: '대한민국',
      currentStatus: 'DOMESTIC_SHIPPING',
      estimatedDelivery: estimatedDelivery.toISOString(),
      events: mockEvents.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    };
  }
}
