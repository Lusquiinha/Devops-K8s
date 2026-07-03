import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, OneToOne, JoinColumn, BaseEntity } from 'typeorm';
import { User } from '../users/user.entity';
import { Answer } from '../answers/answer.entity';
import { UUID } from 'node:crypto';


export enum QuestionStatus {
    PENDING = 'PENDING',
    CLAIMED = 'CLAIMED',
    ANSWERED = 'ANSWERED',
}

@Entity('questions')
export class Question extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: UUID;

    @Column()
    content: string;

    @ManyToOne(() => User)
    client: User;

    @ManyToOne(() => User, { nullable: true })
    consultant: User | null;

    @OneToOne(() => Answer, (answer) => answer.question)
    @JoinColumn()
    answer: Answer;

    @Column({ 
        type: 'enum',
        enum: QuestionStatus,
        default: QuestionStatus.PENDING 
    }) // PENDING, CLAIMED, ANSWERED
    status: QuestionStatus;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    claimedAt: Date | null;
}
