import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getWalkLog, WalkLogType } from '../apis/walkLog'
import OnWalkHeader from '../components/header/OnWalkHeader'
import useRouter from '../hooks/useRouter'
import Icon from '../components/common/Icon'
import SnapItem from '../components/common/Item/SnapItem'
import SnapForm from '../components/common/SnapForm'
import Modal from '../components/common/Modal'
import styles from './OnWalk.module.scss'
import { createSnap } from '../apis/snap'
import { differenceInSeconds } from '../utils/date-fns'

export default function OnWalk() {
  const { id: walkLogId } = useParams()
  const [walkLog, setWalkLog] = useState<WalkLogType | null>(null)
  const [isSnapFormOpen, setIsSnapFormOpen] = useState(false)
  const [isStopModalOpen, setIsStopModalOpen] = useState(false)
  const { routeTo } = useRouter()
  const createdDate = walkLog && new Date(walkLog.createdAt)

  const stopModalData = {
    title: '걷기를 종료하시겠어요?',
    options: [
      { id: 1, label: '걷기 종료', handleClick: () => stopWalk() },
      { id: 2, label: '계속 걷기', handleClick: () => setIsStopModalOpen(false) },
    ],
  }

  const takeSnapClick = () => setIsSnapFormOpen(true)

  const submitSnap = async (formData: FormData) => {
    if (walkLogId === undefined) return
    const response = await createSnap({ walkLogId, data: formData })
    if (response === 'success') {
      getWalkLogData()
      setIsSnapFormOpen(false)
    }
  }

  const getWalkLogData = async () => {
    const data = await getWalkLog(Number(walkLogId))
    if (data?.walkLogStatus === 'STOP') {
      routeTo('/')
      return
    }
    if (data) {
      setWalkLog(data)
    }
  }

  const stopWalk = async () => {
    if (walkLogId === undefined) return
    console.log('종료')
  }

  useEffect(() => {
    getWalkLogData()
  }, [])

  if (walkLog === null) return <div>걷기 준비 중</div>

  return (
    <>
      {isSnapFormOpen && (
        <SnapForm
          titleSuffix='남기기'
          handleCancel={() => setIsSnapFormOpen(false)}
          handleSubmit={submitSnap}
        />
      )}

      {isStopModalOpen && (
        <Modal modalData={stopModalData} onClose={() => setIsStopModalOpen(false)} />
      )}

      <OnWalkHeader
        startedAt={walkLog.createdAt}
        handleFinishClick={() => setIsStopModalOpen(true)}
      />

      <div className={styles.snapBox}>
        <button className={styles.snapbutton} type='button' onClick={takeSnapClick}>
          순간기록 남기기
          <Icon name='camera-color' />
        </button>
        <ul className={styles.snaplist}>
          {(walkLog.walkLogContents &&
            (walkLog.walkLogContents.length === 0 ? (
              <div>작성하신 순간기록이 없습니다.</div>
            ) : (
              walkLog.walkLogContents.map(({ walkLogContentId, text, createdAt, imageUrl }) => {
                const seconds = differenceInSeconds(new Date(createdAt), createdDate as Date)
                return (
                  <SnapItem
                    key={walkLogContentId}
                    walkLogContentId={walkLogContentId}
                    content={text}
                    seconds={seconds}
                    imageUrl={imageUrl}
                  />
                )
              })
            ))) || <div>순간기록을 불러오는 중입니다.</div>}
        </ul>
      </div>
    </>
  )
}
